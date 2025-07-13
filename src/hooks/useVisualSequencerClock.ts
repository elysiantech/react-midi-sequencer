// hooks/useVisualSequencerClock.ts

import { useEffect, useRef, useState } from "react"

export type UseVisualClockOptions = {
  bpm: number
  bars: number
  isPlaying: boolean
  onStep: (step: number, info: { isDownbeat: boolean; isBeat: boolean }) => void
  stepsPerBar?: number // default: 16
  clickEnabled?: boolean // used to drive external metronome clicks
}

export function useVisualSequencerClock({
  bpm,
  bars,
  isPlaying,
  onStep,
  stepsPerBar = 16,
  clickEnabled = true
}: UseVisualClockOptions) {
  const totalSteps = bars * stepsPerBar
  const [currentStep, setCurrentStep] = useState(0)
  const stepRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      stepRef.current = 0
      setCurrentStep(0)
      return
    }

    const msPerStep = (60_000 / bpm) / 4 // 4 steps per beat = 16 steps per bar
    intervalRef.current = setInterval(() => {
      const step = stepRef.current
      const isBeat = step % 4 === 0
      const isDownbeat = step % stepsPerBar === 0

      if (clickEnabled && onStep) {
        onStep(step, { isDownbeat, isBeat })
      }

      setCurrentStep(step)
      stepRef.current = (step + 1) % totalSteps
    }, msPerStep)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [bpm, bars, isPlaying, onStep, clickEnabled, stepsPerBar])

  return {currentStep}
}