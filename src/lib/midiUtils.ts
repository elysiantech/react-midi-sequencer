// Complete MIDI note mapping from 0-127
export function getMidiNoteName(midiNumber: number): string {
  if (midiNumber < 0 || midiNumber > 127) {
    return `Note ${midiNumber}`
  }

  const noteNames = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
  const octave = Math.floor(midiNumber / 12) - 1
  const noteIndex = midiNumber % 12
  
  return `${noteNames[noteIndex]}${octave}`
}

export function formatMidiNote(midiNumber: number): string {
  return `${midiNumber} (${getMidiNoteName(midiNumber)})`
}

// Common drum kit MIDI notes for reference
export const DRUM_NOTES = [
  { value: 36, name: "C2 (Kick)" },
  { value: 38, name: "D2 (Snare)" },
  { value: 42, name: "G♭2 (Hi-Hat Closed)" },
  { value: 46, name: "B♭2 (Hi-Hat Open)" },
  { value: 49, name: "D♭3 (Crash)" },
  { value: 51, name: "E♭3 (Ride)" },
  { value: 47, name: "B2 (Low Tom)" },
  { value: 48, name: "C3 (High Tom)" },
]