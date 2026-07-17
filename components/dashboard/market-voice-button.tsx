"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { speak, stopSpeaking } from "@/lib/speech"

type Status = "idle" | "loading" | "speaking" | "error"

export function MarketVoiceButton({ autoPlay = false }: { autoPlay?: boolean }) {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const hasAutoPlayed = useRef(false)

  async function fetchAndSpeak() {
    if (status === "speaking") {
      stopSpeaking()
      setStatus("idle")
      return
    }

    setStatus("loading")
    setError(null)

    try {
      const res = await fetch("/api/market/voice-briefing")
      if (!res.ok) throw new Error("Failed to fetch briefing")
      const { commentary } = await res.json()

      setStatus("speaking")
      speak(commentary, () => setStatus("idle"))
    } catch {
      setError("Could not load market briefing.")
      setStatus("error")
    }
  }

  // Auto-play on mount if requested
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true
      // Small delay so the page settles first
      const t = setTimeout(fetchAndSpeak, 1500)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay])

  // Stop on unmount
  useEffect(() => () => stopSpeaking(), [])

  const label =
    status === "loading" ? "Loading briefing…"
    : status === "speaking" ? "Tap to stop"
    : "Market briefing"

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={fetchAndSpeak}
        disabled={status === "loading"}
        title={label}
        className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
        style={{
          background: status === "speaking"
            ? "linear-gradient(135deg, #7B5CF0 0%, #4F8EF7 100%)"
            : "linear-gradient(135deg, #4F8EF7 0%, #7B5CF0 100%)",
          color: "#fff",
          boxShadow: status === "speaking"
            ? "0 0 20px rgba(123,92,240,0.5)"
            : "0 4px 14px rgba(79,142,247,0.35)",
        }}
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "speaking" ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        {label}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
