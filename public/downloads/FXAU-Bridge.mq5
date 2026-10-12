//+------------------------------------------------------------------+
//|                                                  FXAU-Bridge.mq5 |
//|  Connects this MT5 terminal to FXAU. FXAU bots decide when to    |
//|  trade; this EA streams closed candles + account data to FXAU    |
//|  and executes the orders it receives, sized from live symbol     |
//|  data so each trade risks the bot's configured % of balance.     |
//|                                                                  |
//|  Setup:                                                          |
//|   1. Tools > Options > Expert Advisors: tick "Allow WebRequest   |
//|      for listed URL" and add your FXAU URL (InpServerUrl).       |
//|   2. Turn on the "Algo Trading" button in the MT5 toolbar.       |
//|   3. Drag this EA onto any chart, paste your connection key.     |
//+------------------------------------------------------------------+
#property copyright   "FXAU"
#property version     "1.00"
#property description "Executes FXAU bot orders on this MT5 account. Keep MT5 open for bots to trade."

#include <Trade\Trade.mqh>

input string InpConnectionKey  = "";                            // Connection key (from FXAU)
input string InpServerUrl      = "https://fxaubot.vercel.app";  // FXAU URL
input int    InpPollSeconds    = 5;                             // Poll interval (seconds)
input long   InpMagic          = 20261012;                      // Magic number for FXAU trades
input int    InpSlippagePoints = 50;                            // Max slippage (points)

#define BARS_TO_SEND 200

CTrade   g_trade;
string   g_watchKeys[];      // normalized symbol keys from FXAU, e.g. "XAUUSD"
string   g_watchTfs[];       // FXAU timeframes, e.g. "15m"
datetime g_lastSent[];       // last closed bar uploaded per watch
datetime g_candidate[];      // bar time included in the in-flight request per watch
string   g_fills[];          // JSON fill reports waiting to be sent
string   g_mapKeys[];        // symbol key -> broker symbol cache
string   g_mapVals[];
string   g_status = "starting…";
datetime g_lastOk = 0;
int      g_tradesToday = 0;

//+------------------------------------------------------------------+
int OnInit()
  {
   if(StringLen(InpConnectionKey) < 10)
     {
      Alert("FXAU Bridge: paste your connection key from FXAU into the EA inputs.");
      return(INIT_PARAMETERS_INCORRECT);
     }
   g_trade.SetExpertMagicNumber(InpMagic);
   g_trade.SetDeviationInPoints(InpSlippagePoints);
   EventSetTimer(MathMax(2, InpPollSeconds));
   Print("FXAU Bridge started, server ", InpServerUrl);
   Sync(0);
   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason)
  {
   EventKillTimer();
   Comment("");
  }

void OnTimer() { Sync(0); }

//+------------------------------------------------------------------+
//| Helpers                                                          |
//+------------------------------------------------------------------+
string Alnum(string s)
  {
   StringToUpper(s);
   string r = "";
   for(int i = 0; i < StringLen(s); i++)
     {
      ushort c = StringGetCharacter(s, i);
      if((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9'))
         r += ShortToString(c);
     }
   return r;
  }

string JsonStr(string s)
  {
   StringReplace(s, "\\", "/");
   StringReplace(s, "\"", "'");
   StringReplace(s, "\r", " ");
   StringReplace(s, "\n", " ");
   return "\"" + s + "\"";
  }

void PushString(string &arr[], string v)
  {
   int n = ArraySize(arr);
   ArrayResize(arr, n + 1);
   arr[n] = v;
  }

string Join(string &arr[])
  {
   string r = "";
   for(int i = 0; i < ArraySize(arr); i++)
      r += (i > 0 ? "," : "") + arr[i];
   return r;
  }

ENUM_TIMEFRAMES ToTimeframe(string tf)
  {
   if(tf == "1m")  return PERIOD_M1;
   if(tf == "5m")  return PERIOD_M5;
   if(tf == "15m") return PERIOD_M15;
   if(tf == "30m") return PERIOD_M30;
   if(tf == "1h")  return PERIOD_H1;
   if(tf == "4h")  return PERIOD_H4;
   if(tf == "1d")  return PERIOD_D1;
   return PERIOD_CURRENT;
  }

//| Maps "XAUUSD" to this broker's symbol ("XAUUSDm", "XAUUSD.a"...). |
string ResolveSymbol(string key)
  {
   for(int i = 0; i < ArraySize(g_mapKeys); i++)
      if(g_mapKeys[i] == key) return g_mapVals[i];

   string best = "";
   int total = SymbolsTotal(false);
   for(int i = 0; i < total; i++)
     {
      string name = SymbolName(i, false);
      string norm = Alnum(name);
      if(norm == key) { best = name; break; }
      if(StringFind(norm, key) == 0 && (best == "" || StringLen(name) < StringLen(best)))
         best = name;
     }
   if(best != "")
     {
      SymbolSelect(best, true);
      PushString(g_mapKeys, key);
      PushString(g_mapVals, best);
     }
   return best;
  }

void ShowStatus()
  {
   string lastOk = g_lastOk > 0 ? TimeToString(g_lastOk, TIME_SECONDS) : "never";
   Comment("FXAU Bridge  |  ", g_status,
           "\nLast sync: ", lastOk,
           "   Watching: ", ArraySize(g_watchKeys), " market(s)",
           "   Trades this session: ", g_tradesToday);
  }

//+------------------------------------------------------------------+
//| Request body                                                     |
//+------------------------------------------------------------------+
string PositionsJson()
  {
   string items[];
   for(int i = 0; i < PositionsTotal(); i++)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket)) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      string type = PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY ? "buy" : "sell";
      PushString(items, "{\"symbol\":" + JsonStr(PositionGetString(POSITION_SYMBOL)) +
                 ",\"type\":\"" + type + "\"" +
                 ",\"volume\":" + DoubleToString(PositionGetDouble(POSITION_VOLUME), 2) +
                 ",\"ticket\":\"" + IntegerToString((long)ticket) + "\"" +
                 ",\"profit\":" + DoubleToString(PositionGetDouble(POSITION_PROFIT), 2) + "}");
     }
   return "[" + Join(items) + "]";
  }

string CandlesJson()
  {
   string sets[];
   for(int w = 0; w < ArraySize(g_watchKeys); w++)
     {
      g_candidate[w] = 0;
      string sym = ResolveSymbol(g_watchKeys[w]);
      ENUM_TIMEFRAMES tf = ToTimeframe(g_watchTfs[w]);
      if(sym == "" || tf == PERIOD_CURRENT) continue;

      MqlRates rates[];
      ArraySetAsSeries(rates, false);
      int n = CopyRates(sym, tf, 1, BARS_TO_SEND, rates);   // start at 1: skip the forming bar
      if(n <= 0) continue;                                   // history still loading, retry next poll
      if(rates[n - 1].time == g_lastSent[w]) continue;       // no new closed bar

      int digits = (int)SymbolInfoInteger(sym, SYMBOL_DIGITS);
      string bars = "";
      for(int i = 0; i < n; i++)
        {
         bars += (i > 0 ? "," : "") + "[" + IntegerToString((long)rates[i].time) +
                 "," + DoubleToString(rates[i].open, digits) +
                 "," + DoubleToString(rates[i].high, digits) +
                 "," + DoubleToString(rates[i].low, digits) +
                 "," + DoubleToString(rates[i].close, digits) +
                 "," + IntegerToString(rates[i].tick_volume) + "]";
        }
      PushString(sets, "{\"symbol\":" + JsonStr(g_watchKeys[w]) + ",\"timeframe\":" + JsonStr(g_watchTfs[w]) + ",\"bars\":[" + bars + "]}");
      g_candidate[w] = rates[n - 1].time;
     }
   return "[" + Join(sets) + "]";
  }

//+------------------------------------------------------------------+
//| Sync with FXAU                                                   |
//+------------------------------------------------------------------+
void Sync(int depth)
  {
   string body = "{";
   body += "\"login\":\"" + IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN)) + "\"";
   body += ",\"server\":" + JsonStr(AccountInfoString(ACCOUNT_SERVER));
   body += ",\"company\":" + JsonStr(AccountInfoString(ACCOUNT_COMPANY));
   body += ",\"currency\":" + JsonStr(AccountInfoString(ACCOUNT_CURRENCY));
   body += ",\"balance\":" + DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE), 2);
   body += ",\"equity\":" + DoubleToString(AccountInfoDouble(ACCOUNT_EQUITY), 2);
   body += ",\"positions\":" + PositionsJson();
   body += ",\"fills\":[" + Join(g_fills) + "]";
   body += ",\"candles\":" + CandlesJson();
   body += "}";
   int fillsSent = ArraySize(g_fills);

   char data[];
   int len = StringToCharArray(body, data, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(data, MathMax(0, len - 1));   // drop the trailing \0

   string url = InpServerUrl;
   if(StringSubstr(url, StringLen(url) - 1) == "/") url = StringSubstr(url, 0, StringLen(url) - 1);
   url += "/api/bridge/sync";
   string headers = "Content-Type: application/json\r\nAuthorization: Bearer " + InpConnectionKey + "\r\n";

   char result[];
   string resultHeaders;
   ResetLastError();
   int status = WebRequest("POST", url, headers, 20000, data, result, resultHeaders);
   if(status == -1)
     {
      int err = GetLastError();
      g_status = err == 4014
                 ? "BLOCKED: add " + InpServerUrl + " in Tools > Options > Expert Advisors > Allow WebRequest"
                 : "network error " + IntegerToString(err) + ", retrying";
      ShowStatus();
      return;
     }

   string resp = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
   if(status != 200)
     {
      g_status = "FXAU error " + IntegerToString(status) + ": " + resp;
      if(status == 401) g_status += "  (check your connection key)";
      ShowStatus();
      return;
     }

   // Success: reported fills are delivered, uploaded bars are done
   if(fillsSent > 0)
     {
      int remaining = ArraySize(g_fills) - fillsSent;
      for(int i = 0; i < remaining; i++) g_fills[i] = g_fills[i + fillsSent];
      ArrayResize(g_fills, MathMax(0, remaining));
     }
   for(int w = 0; w < ArraySize(g_watchKeys); w++)
      if(g_candidate[w] > 0) g_lastSent[w] = g_candidate[w];

   g_lastOk = TimeCurrent();
   g_status = "CONNECTED";
   HandleResponse(resp);
   ShowStatus();

   // Report new fills right away instead of waiting a full poll
   if(depth == 0 && ArraySize(g_fills) > 0) Sync(1);
  }

void HandleResponse(string resp)
  {
   string lines[];
   int count = StringSplit(resp, '\n', lines);
   string newKeys[], newTfs[];

   for(int i = 0; i < count; i++)
     {
      string line = lines[i];
      StringTrimRight(line);
      StringTrimLeft(line);
      if(line == "" || line == "OK") continue;

      string p[];
      int n = StringSplit(line, '|', p);
      if(p[0] == "WATCH" && n >= 3)
        {
         PushString(newKeys, p[1]);
         PushString(newTfs, p[2]);
        }
      else if(p[0] == "ORDER" && n >= 7)
        {
         ExecuteOrder(p[1], p[2], p[3], StringToDouble(p[4]), StringToDouble(p[5]), StringToDouble(p[6]));
        }
     }

   // Rebuild the watch list, keeping upload progress for markets still watched
   int m = ArraySize(newKeys);
   datetime keep[];
   ArrayResize(keep, m);
   for(int i = 0; i < m; i++)
     {
      keep[i] = 0;
      for(int j = 0; j < ArraySize(g_watchKeys); j++)
         if(g_watchKeys[j] == newKeys[i] && g_watchTfs[j] == newTfs[i]) keep[i] = g_lastSent[j];
     }
   ArrayResize(g_watchKeys, m);
   ArrayResize(g_watchTfs, m);
   ArrayResize(g_lastSent, m);
   ArrayResize(g_candidate, m);
   for(int i = 0; i < m; i++)
     {
      g_watchKeys[i] = newKeys[i];
      g_watchTfs[i] = newTfs[i];
      g_lastSent[i] = keep[i];
      g_candidate[i] = 0;
     }
  }

//+------------------------------------------------------------------+
//| Order execution                                                  |
//+------------------------------------------------------------------+
void ReportFill(string id, bool ok, string ticket, double price, double volume, double sl, double tp, int digits, string error)
  {
   string json = "{\"id\":" + JsonStr(id) + ",\"ok\":" + (ok ? "true" : "false");
   if(ok)
      json += ",\"ticket\":\"" + ticket + "\"" +
              ",\"price\":" + DoubleToString(price, digits) +
              ",\"volume\":" + DoubleToString(volume, 2) +
              ",\"sl\":" + DoubleToString(sl, digits) +
              ",\"tp\":" + DoubleToString(tp, digits);
   else
      json += ",\"error\":" + JsonStr(error);
   json += "}";
   PushString(g_fills, json);
  }

void Reject(string id, string error)
  {
   Print("FXAU order ", id, " rejected: ", error);
   ReportFill(id, false, "", 0, 0, 0, 0, 2, error);
  }

void ExecuteOrder(string id, string key, string side, double riskPct, double slPct, double tpPct)
  {
   string sym = ResolveSymbol(key);
   if(sym == "") { Reject(id, "Symbol " + key + " is not offered by this broker"); return; }
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED)) { Reject(id, "Algo Trading is switched off in MT5 (toolbar button)"); return; }
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED)) { Reject(id, "Algo trading is not allowed for the FXAU EA (EA properties > Common)"); return; }
   if(slPct <= 0 || tpPct <= 0) { Reject(id, "Stop loss and take profit must be above 0%"); return; }

   MqlTick tick;
   if(!SymbolInfoTick(sym, tick) || tick.ask <= 0) { Reject(id, "No live price for " + sym + " (market closed?)"); return; }

   bool   buy    = side == "buy";
   double entry  = buy ? tick.ask : tick.bid;
   int    digits = (int)SymbolInfoInteger(sym, SYMBOL_DIGITS);
   double point  = SymbolInfoDouble(sym, SYMBOL_POINT);
   double slDist = entry * slPct / 100.0;
   double tpDist = entry * tpPct / 100.0;

   double minStop = (double)SymbolInfoInteger(sym, SYMBOL_TRADE_STOPS_LEVEL) * point;
   if(slDist <= minStop || tpDist <= minStop)
     {
      Reject(id, StringFormat("Stop loss / take profit too close: broker minimum distance is %s", DoubleToString(minStop, digits)));
      return;
     }
   double sl = NormalizeDouble(buy ? entry - slDist : entry + slDist, digits);
   double tp = NormalizeDouble(buy ? entry + tpDist : entry - tpDist, digits);

   // Risk-based size: loss at the stop = riskPct of balance
   double tickSize  = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_SIZE);
   double tickValue = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_VALUE_LOSS);
   if(tickValue <= 0) tickValue = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_VALUE);
   if(tickSize <= 0 || tickValue <= 0) { Reject(id, "Broker did not provide tick value for " + sym); return; }

   double risk       = AccountInfoDouble(ACCOUNT_BALANCE) * riskPct / 100.0;
   double lossPerLot = slDist / tickSize * tickValue;
   double step       = SymbolInfoDouble(sym, SYMBOL_VOLUME_STEP);
   double minVol     = SymbolInfoDouble(sym, SYMBOL_VOLUME_MIN);
   double maxVol     = SymbolInfoDouble(sym, SYMBOL_VOLUME_MAX);
   int    volDigits  = (int)MathMax(0, MathCeil(-MathLog10(step)));
   double volume     = MathFloor(risk / lossPerLot / step + 1e-9) * step;
   volume = NormalizeDouble(MathMin(volume, maxVol), volDigits);

   if(volume < minVol)
     {
      Reject(id, StringFormat("Position too small: risking %.2f %s with a %.2f%% stop = %.3f lots, broker minimum is %.2f. "
                              "Raise risk %% or tighten the stop (min lot here risks %.2f).",
                              risk, AccountInfoString(ACCOUNT_CURRENCY), slPct, risk / lossPerLot, minVol, minVol * lossPerLot));
      return;
     }

   g_trade.SetTypeFillingBySymbol(sym);
   bool sent = buy ? g_trade.Buy(volume, sym, 0, sl, tp, "FXAU") : g_trade.Sell(volume, sym, 0, sl, tp, "FXAU");
   uint rc = g_trade.ResultRetcode();
   if(!sent || (rc != TRADE_RETCODE_DONE && rc != TRADE_RETCODE_DONE_PARTIAL && rc != TRADE_RETCODE_PLACED))
     {
      Reject(id, "MT5 " + IntegerToString(rc) + ": " + g_trade.ResultRetcodeDescription());
      return;
     }

   double price = g_trade.ResultPrice() > 0 ? g_trade.ResultPrice() : entry;
   g_tradesToday++;
   Print("FXAU: ", side, " ", DoubleToString(volume, volDigits), " ", sym, " @ ", DoubleToString(price, digits),
         "  SL ", DoubleToString(sl, digits), "  TP ", DoubleToString(tp, digits));
   ReportFill(id, true, IntegerToString((long)g_trade.ResultOrder()), price, g_trade.ResultVolume() > 0 ? g_trade.ResultVolume() : volume, sl, tp, digits, "");
  }
//+------------------------------------------------------------------+
