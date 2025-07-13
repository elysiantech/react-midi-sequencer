'use client'
import { useEffect, useRef } from 'react'

interface MetronomeProps {
  bpm: number
  isPlaying: boolean
}

export function Metronome({ bpm, isPlaying }: MetronomeProps) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const beatCountRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const playClick = (isDownbeat: boolean) => {
    const ctx = audioCtxRef.current
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(isDownbeat ? 1000 : 750, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  }

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current)
      beatCountRef.current = 0
      return
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
    }

    const intervalMs = (60 / bpm) * 1000
    timerRef.current = setInterval(() => {
      const isDownbeat = beatCountRef.current % 4 === 0
      playClick(isDownbeat)
      beatCountRef.current++
    }, intervalMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [bpm, isPlaying])

  return null
}