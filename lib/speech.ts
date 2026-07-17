"use client"

// Picks the best available female voice on the device
function getFemaleVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  // Preferred female voice names across platforms
  const preferred = [
    "Samantha",       // macOS / iOS
    "Karen",          // macOS
    "Moira",          // macOS
    "Victoria",       // macOS
    "Google US English Female",  // Chrome Android/Desktop
    "Microsoft Zira", // Windows
    "Microsoft Aria", // Windows
    "en-US-AriaNeural",
    "en-GB-SoniaNeural",
  ]

  for (const name of preferred) {
    const v = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()))
    if (v) return v
  }

  // Fallback: any English female-named voice
  const fallback = voices.find(
    (v) => v.lang.startsWith("en") && /female|woman|girl|zira|aria|samantha|karen|victoria|sonia|nova/i.test(v.name),
  )
  if (fallback) return fallback

  // Last resort: first English voice
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null
}

let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()
  currentUtterance = null

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.92
  utterance.pitch = 1.05
  utterance.volume = 1

  // Voices may not be loaded yet on first call
  const trySpeak = () => {
    const voice = getFemaleVoice()
    if (voice) utterance.voice = voice
    if (onEnd) utterance.onend = onEnd
    currentUtterance = utterance
    window.speechSynthesis.speak(utterance)
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak()
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null
      trySpeak()
    }
  }
}

export function stopSpeaking(): void {
  if (typeof window === "undefined") return
  window.speechSynthesis.cancel()
  currentUtterance = null
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined") return false
  return window.speechSynthesis.speaking
}
