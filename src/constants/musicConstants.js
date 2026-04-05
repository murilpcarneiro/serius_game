export const MUSIC_SETTINGS_KEY = 'integra:music-settings:v1'

export const MUSIC_SOURCE = {
  mode: 'file-first',
  fileUrl: '/audio/house-stark-theme.mp3',
  fallbackToProcedural: true,
}

export const AMBIENT_MUSIC_CONFIG = {
  cycleSeconds: 8,
  drone: {
    root: 146.83, // D3
    type: 'triangle',
    gain: 0.028,
  },
  pulse: {
    notes: [146.83, 174.61, 130.81, 146.83], // D3 F3 C3 D3
    type: 'triangle',
    gain: 0.042,
    noteDuration: 0.95,
    stepSeconds: 2,
  },
  lead: {
    notes: [293.66, 261.63, 220.0, 196.0], // D4 C4 A3 G3
    type: 'sine',
    gain: 0.026,
    noteDuration: 1.5,
    offsets: [0.55, 2.55, 4.55, 6.55],
  },
}
