import { useEffect, useRef, useState } from 'react'
import {
  AMBIENT_MUSIC_CONFIG,
  MUSIC_SOURCE,
  MUSIC_SETTINGS_KEY,
} from '../constants/musicConstants'

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

  const ctxRef = useRef(null)
  const masterGainRef = useRef(null)
  const timerRef = useRef(null)
  const audioElRef = useRef(null)
  const warmedRef = useRef(false)

  const ensureAudioChain = () => {
    if (typeof window === 'undefined') return null

    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null

      const ctx = new Ctx()
      const master = ctx.createGain()
      master.gain.value = 0.0001
      master.connect(ctx.destination)

      ctxRef.current = ctx
      masterGainRef.current = master
    }

    return { ctx: ctxRef.current, master: masterGainRef.current }
  }

  const playNote = (ctx, master, freq, when, duration, type, gain) => {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, when)

    amp.gain.setValueAtTime(0.0001, when)
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + 0.05)
    amp.gain.exponentialRampToValueAtTime(0.0001, when + duration)

    osc.connect(amp)
    amp.connect(master)

    osc.start(when)
    osc.stop(when + duration + 0.04)
  }

  const scheduleCycle = () => {
    const chain = ensureAudioChain()
    if (!chain) return

    const { ctx, master } = chain
    const now = ctx.currentTime + 0.03
    const config = AMBIENT_MUSIC_CONFIG

    playNote(
      ctx,
      master,
      config.drone.root,
      now,
      config.cycleSeconds,
      config.drone.type,
      config.drone.gain,
    )

    config.pulse.notes.forEach((freq, index) => {
      const when = now + index * config.pulse.stepSeconds
      playNote(
        ctx,
        master,
        freq,
        when,
        config.pulse.noteDuration,
        config.pulse.type,
        config.pulse.gain,
      )
    })

    config.lead.notes.forEach((freq, index) => {
      const when = now + (config.lead.offsets[index] ?? 0)
      playNote(
        ctx,
        master,
        freq,
        when,
        config.lead.noteDuration,
        config.lead.type,
        config.lead.gain,
      )
    })
  }

  const stopCycle = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    const master = masterGainRef.current
    const ctx = ctxRef.current
    if (master && ctx) {
      const now = ctx.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value || 0.0001, now)
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
    }
  }

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
      stopCycle()
      return
    }

    const startPreferred = async () => {
      const wantsFileFirst = MUSIC_SOURCE?.mode === 'file-first'
      const playedFile = wantsFileFirst ? await startFileAudio() : false
      if (!playedFile && MUSIC_SOURCE?.fallbackToProcedural !== false) {
        await startCycle()
      }
    }

    startPreferred().catch(() => {
      // Navegador pode bloquear áudio sem gesto; rearmamos no primeiro clique.
    })

    const warmOnGesture = () => {
      if (warmedRef.current || !musicEnabled) return
      warmedRef.current = true
      const wantsFileFirst = MUSIC_SOURCE?.mode === 'file-first'
      const startPreferred = async () => {
        const playedFile = wantsFileFirst ? await startFileAudio() : false
        if (!playedFile && MUSIC_SOURCE?.fallbackToProcedural !== false) {
          await startCycle()
        }
      }
      startPreferred().catch(() => {})
      window.removeEventListener('pointerdown', warmOnGesture)
      window.removeEventListener('keydown', warmOnGesture)
    }

    window.addEventListener('pointerdown', warmOnGesture, { once: true })
    window.addEventListener('keydown', warmOnGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', warmOnGesture)
      window.removeEventListener('keydown', warmOnGesture)
      stopFileAudio()
      stopCycle()
    }
  }, [musicEnabled])

  useEffect(() => {
    if (audioElRef.current) {
      audioElRef.current.volume = clampVolume(musicVolume)
    }

    const master = masterGainRef.current
    const ctx = ctxRef.current
    if (!master || !ctx || !musicEnabled) return

    const now = ctx.currentTime
    const target = Math.max(0.0001, musicVolume * 0.16)
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(Math.max(master.gain.value || 0.0001, 0.0001), now)
    master.gain.linearRampToValueAtTime(target, now + 0.18)
  }, [musicVolume, musicEnabled])

  useEffect(
    () => () => {
      stopFileAudio()
      stopCycle()
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {})
      }
      if (audioElRef.current) {
        audioElRef.current.src = ''
      }
      ctxRef.current = null
      masterGainRef.current = null
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
