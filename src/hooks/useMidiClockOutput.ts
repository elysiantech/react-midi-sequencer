import { useEffect, useRef, useState } from "react"

// MIDI System Real-Time Messages
const MIDI_CLOCK = 0xF8      // Clock tick - sent 24 times per quarter note
const MIDI_START = 0xFA      // Start playback
const MIDI_STOP = 0xFC       // Stop playback

interface MidiClockDiagnostics {
  tickCount: number
  startTime: number
  lastTickTime: number
  averageDrift: number
}

// High-precision MIDI clock scheduler using AudioContext timing
class AudioContextMidiClock {
  private audioContext: AudioContext | null = null
  private output: MIDIOutput | null = null
  private bpm: number = 120
  private nextTickTime: number = 0
  private tickCount: number = 0
  private isRunning: boolean = false
  private schedulerTimeoutId: number | null = null
  private diagnostics: MidiClockDiagnostics

  constructor() {
    this.diagnostics = {
      tickCount: 0,
      startTime: 0,
      lastTickTime: 0,
      averageDrift: 0
    }
  }

  async init() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
      // Resume AudioContext in case it's suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
    }
  }

  setBpm(bpm: number) {
    this.bpm = bpm
  }

  setOutput(output: MIDIOutput | null) {
    this.output = output
  }

  start() {
    if (!this.audioContext || !this.output || this.isRunning) return

    this.isRunning = true
    this.tickCount = 0
    this.diagnostics.tickCount = 0
    this.diagnostics.startTime = this.audioContext.currentTime
    this.diagnostics.lastTickTime = 0
    
    // Send MIDI start command
    this.output.send([MIDI_START])
    console.log('[MIDI Clock] Started at', this.bpm, 'BPM')

    // Initialize next tick time with small offset for immediate processing
    this.nextTickTime = this.audioContext.currentTime + 0.01

    // Start the scheduler loop
    this.schedulerLoop()
  }

  stop() {
    if (!this.isRunning) return

    this.isRunning = false
    
    // Clear scheduler timeout
    if (this.schedulerTimeoutId) {
      clearTimeout(this.schedulerTimeoutId)
      this.schedulerTimeoutId = null
    }

    // Send MIDI stop command
    if (this.output) {
      this.output.send([MIDI_STOP])
      console.log('[MIDI Clock] Stopped after', this.tickCount, 'ticks')
    }
  }

  private schedulerLoop() {
    if (!this.isRunning || !this.audioContext || !this.output) return

    const currentTime = this.audioContext.currentTime
    const lookAhead = 0.1 // Look ahead 100ms
    const tickInterval = (60 / this.bpm) / 24 // 24 ticks per quarter note

    // Schedule all ticks within the lookahead window
    while (this.nextTickTime < currentTime + lookAhead) {
      this.scheduleMidiTick(this.nextTickTime)
      this.nextTickTime += tickInterval
    }

    // Schedule next scheduler call
    this.schedulerTimeoutId = window.setTimeout(() => this.schedulerLoop(), 25)
  }

  private scheduleMidiTick(time: number) {
    if (!this.audioContext || !this.output) return

    // Calculate when to send the MIDI message
    const currentTime = this.audioContext.currentTime
    const delay = Math.max(0, (time - currentTime) * 1000) // Convert to milliseconds

    setTimeout(() => {
      if (this.isRunning && this.output) {
        // Send MIDI clock tick
        this.output.send([MIDI_CLOCK])
        
        // Update diagnostics
        this.tickCount++
        this.diagnostics.tickCount = this.tickCount
        
        const now = this.audioContext?.currentTime || 0
        if (this.diagnostics.lastTickTime > 0) {
          const expectedInterval = (60 / this.bpm) / 24
          const actualInterval = now - this.diagnostics.lastTickTime
          const drift = Math.abs(actualInterval - expectedInterval) * 1000 // Convert to ms
          
          // Update rolling average drift (simple exponential smoothing)
          this.diagnostics.averageDrift = this.diagnostics.averageDrift * 0.9 + drift * 0.1
        }
        this.diagnostics.lastTickTime = now

        // Log every 96 ticks (4 beats)
        if (this.tickCount % 96 === 0) {
          const elapsed = now - this.diagnostics.startTime
          console.log(`[MIDI Clock] Tick ${this.tickCount}, Elapsed: ${elapsed.toFixed(2)}s, Avg Drift: ${this.diagnostics.averageDrift.toFixed(3)}ms`)
        }
      }
    }, delay)
  }

  getDiagnostics(): MidiClockDiagnostics {
    return { ...this.diagnostics }
  }

  get running(): boolean {
    return this.isRunning
  }

  cleanup() {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

export function useMidiClockOutput(
  bpm: number, 
  isPlaying: boolean, 
  output: MIDIOutput | null
) {
  const clockRef = useRef<AudioContextMidiClock | null>(null)
  const [diagnostics, setDiagnostics] = useState<MidiClockDiagnostics>({
    tickCount: 0,
    startTime: 0,
    lastTickTime: 0,
    averageDrift: 0
  })

  // Initialize clock instance
  useEffect(() => {
    if (!clockRef.current) {
      clockRef.current = new AudioContextMidiClock()
    }

    return () => {
      if (clockRef.current) {
        clockRef.current.cleanup()
        clockRef.current = null
      }
    }
  }, [])

  // Update BPM
  useEffect(() => {
    if (clockRef.current) {
      clockRef.current.setBpm(bpm)
    }
  }, [bpm])

  // Update MIDI output
  useEffect(() => {
    if (clockRef.current) {
      clockRef.current.setOutput(output)
    }
  }, [output])

  // Handle play/stop state changes
  useEffect(() => {
    const initAndStart = async () => {
      if (clockRef.current && output) {
        await clockRef.current.init()
        if (isPlaying) {
          clockRef.current.start()
        } else {
          clockRef.current.stop()
        }
      }
    }

    if (isPlaying && output) {
      initAndStart()
    } else if (clockRef.current) {
      clockRef.current.stop()
    }
  }, [isPlaying, output])

  // Update diagnostics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (clockRef.current) {
        setDiagnostics(clockRef.current.getDiagnostics())
      }
    }, 100) // Update every 100ms

    return () => clearInterval(interval)
  }, [])

  // Return current diagnostics for debugging
  return {
    isClockRunning: clockRef.current?.running || false,
    tickCount: diagnostics.tickCount,
    averageDrift: diagnostics.averageDrift
  }
}