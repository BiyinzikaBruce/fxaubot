import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const ADMIN_EMAIL = "programmingwithbruce@gmail.com"

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const body = await req.json()
    const { name, email, phone, country, experience, message } = body

    if (!name || !email || !phone || !country || !experience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send notification email to admin
    await resend.emails.send({
      from: `FXAU Academy <${ADMIN_EMAIL}>`,
      to: ["programmingwithbruce@gmail.com"],
      subject: `🎓 New Academy Signup — ${name} (${country})`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#08090E;color:#F0F2F7;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#4F8EF7,#7B5CF0);padding:24px 32px;">
            <h1 style="margin:0;font-size:22px;color:#fff;">🎓 New Forex Academy Uganda Signup</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">A new student has applied to join the academy</p>
          </div>
          <div style="padding:32px;background:#111318;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#8B93A8;font-size:13px;width:140px;">Full Name</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-weight:700;font-size:14px;">${name}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#8B93A8;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-weight:700;font-size:14px;"><a href="mailto:${email}" style="color:#4F8EF7;">${email}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#8B93A8;font-size:13px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-weight:700;font-size:14px;">${phone}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#8B93A8;font-size:13px;">Country</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-weight:700;font-size:14px;">${country}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#8B93A8;font-size:13px;">Experience</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-weight:700;font-size:14px;">${experience}</td></tr>
              ${message ? `<tr><td style="padding:10px 0;color:#8B93A8;font-size:13px;vertical-align:top;">Message</td><td style="padding:10px 0;font-size:14px;line-height:1.6;">${message}</td></tr>` : ""}
            </table>
            <div style="margin-top:24px;padding:16px;border-radius:10px;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.2);">
              <p style="margin:0;font-size:13px;color:#8B93A8;">Reply to this email or reach out to <strong style="color:#4F8EF7;">${email}</strong> to follow up with this student.</p>
            </div>
          </div>
          <div style="padding:16px 32px;background:#08090E;text-align:center;">
            <p style="margin:0;font-size:12px;color:#525A6E;">FXAU · Forex Academy Uganda Partnership · fxaubot.vercel.app</p>
          </div>
        </div>
      `,
    })

    // Send confirmation email to the student
    await resend.emails.send({
      from: `FXAU Academy <${ADMIN_EMAIL}>`,
      to: [email],
      subject: "🎓 You're registered — Forex Academy Uganda × FXAU",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#08090E;color:#F0F2F7;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#4F8EF7,#7B5CF0);padding:24px 32px;">
            <h1 style="margin:0;font-size:22px;color:#fff;">Welcome to Forex Academy Uganda 🎓</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your registration has been received — we'll be in touch soon.</p>
          </div>
          <div style="padding:32px;background:#111318;">
            <p style="font-size:16px;line-height:1.7;color:#8B93A8;">Hi <strong style="color:#F0F2F7;">${name}</strong>,</p>
            <p style="font-size:15px;line-height:1.75;color:#8B93A8;">Thank you for signing up for <strong style="color:#F0F2F7;">Forex Academy Uganda</strong> powered by FXAU. We have received your application and our team will reach out to you within <strong style="color:#4F8EF7;">24–48 hours</strong> to confirm your spot and share onboarding details.</p>
            <div style="margin:24px 0;padding:20px;border-radius:12px;background:rgba(79,142,247,0.08);border:1px solid rgba(79,142,247,0.2);">
              <p style="margin:0 0 12px;font-size:14px;color:#F0F2F7;font-weight:700;">While you wait, get ahead by:</p>
              <ul style="margin:0;padding-left:20px;color:#8B93A8;font-size:14px;line-height:2;">
                <li>Creating your free FXAU account at <a href="https://fxaubot.vercel.app/register" style="color:#4F8EF7;">fxaubot.vercel.app/register</a></li>
                <li>Joining our Telegram community at <a href="https://t.me/fxaubot" style="color:#4F8EF7;">t.me/fxaubot</a></li>
                <li>Exploring our free trading tools and journal</li>
              </ul>
            </div>
            <p style="font-size:14px;color:#8B93A8;line-height:1.7;">Questions? Reply to this email or message us on Telegram — we respond within hours.</p>
            <p style="font-size:14px;color:#8B93A8;margin-top:24px;">Trade smart,<br/><strong style="color:#F0F2F7;">The FXAU Team</strong></p>
          </div>
          <div style="padding:16px 32px;background:#08090E;text-align:center;">
            <p style="margin:0;font-size:12px;color:#525A6E;">FXAU · Forex Academy Uganda Partnership · fxaubot.vercel.app</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Academy signup error:", err)
    return NextResponse.json({ error: "Failed to process signup" }, { status: 500 })
  }
}
