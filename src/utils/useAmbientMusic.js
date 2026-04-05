import { useEffect, useRef, useState } from 'react'
import { MUSIC_SOURCE, MUSIC_SETTINGS_KEY } from '../constants/musicConstants'

const DEFAULT_SETTINGS = {
  enabled: false,
  volume: 0.28,
}

function readMusicSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(MUSIC_SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    const volume = Number(parsed?.volume)
    return {
      enabled: Boolean(parsed?.enabled),
      volume:
        Number.isFinite(volume) && volume >= 0 && volume <= 1
          ? volume
          : DEFAULT_SETTINGS.volume,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function clampVolume(value) {
  return Math.max(0, Math.min(1, Number(value) || 0))
}

export function useAmbientMusic() {
  const initial = readMusicSettings()
  const [musicEnabled, setMusicEnabled] = useState(initial.enabled)
  const [musicVolume, setMusicVolumeState] = useState(initial.volume)

  const audioElRef = useRef(null)
  const warmedRef = useRef(false)

  const stopFileAudio = () => {
    const audio = audioElRef.current
    if (!audio) return
    audio.pause()
    try {
      audio.currentTime = 0
    } catch {
      // Alguns navegadores podem bloquear seek em streams; ignorar.
    }
  }

  const startFileAudio = async () => {
    if (typeof window === 'undefined') return false
    if (!MUSIC_SOURCE?.fileUrl) return false

    let audio = audioElRef.current
    if (!audio) {
      audio = new window.Audio(MUSIC_SOURCE.fileUrl)
      audio.loop = true
      audio.preload = 'auto'
      audioElRef.current = audio
    }

    audio.volume = clampVolume(musicVolume)
    try {
      await audio.play()
      return true
    } catch {
      return false
    }
  }

  const startCycle = async () => {
    const chain = ensureAudioChain()
    if (!chain) return

    const { ctx, master } = chain
    if (ctx.state !== 'running') {
      await ctx.resume()
    }

    const now = ctx.currentTime
    const target = Math.max(0.0001, musicVolume * 0.16)
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(Math.max(master.gain.value || 0.0001, 0.0001), now)
    master.gain.exponentialRampToValueAtTime(target, now + 0.38)

    scheduleCycle()
    if (!timerRef.current) {
      timerRef.current = window.setInterval(
        scheduleCycle,
        AMBIENT_MUSIC_CONFIG.cycleSeconds * 1000,
      )
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      MUSIC_SETTINGS_KEY,
      JSON.stringify({ enabled: musicEnabled, volume: musicVolume }),
    )
  }, [musicEnabled, musicVolume])

  useEffect(() => {
    if (!musicEnabled) {
      stopFileAudio()
      return
    }

    startFileAudio().catch(() => {
      // Navegador pode bloquear áudio sem gesto; rearmamos no primeiro clique.
    })

    const warmOnGesture = () => {
      if (warmedRef.current || !musicEnabled) return
      warmedRef.current = true
      startFileAudio().catch(() => {})
      window.removeEventListener('pointerdown', warmOnGesture)
      window.removeEventListener('keydown', warmOnGesture)
    }

    window.addEventListener('pointerdown', warmOnGesture, { once: true })
    window.addEventListener('keydown', warmOnGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', warmOnGesture)
      window.removeEventListener('keydown', warmOnGesture)
      stopFileAudio()
    }
  }, [musicEnabled])

  useEffect(() => {
    if (audioElRef.current) {
      audioElRef.current.volume = clampVolume(musicVolume)
    }
  }, [musicVolume])

  useEffect(
    () => () => {
      stopFileAudio()
      if (audioElRef.current) {
        audioElRef.current.src = ''
      }
      audioElRef.current = null
    },
    [],
  )

  const toggleMusic = () => setMusicEnabled((v) => !v)
  const setMusicVolume = (value) => setMusicVolumeState(clampVolume(value))

  return {
    musicEnabled,
    musicVolume,
    toggleMusic,
    setMusicVolume,
  }
}
