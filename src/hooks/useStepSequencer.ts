// hooks/useStepSequencer.ts

import { useEffect, useRef, useState, useCallback } from "react"

export type StepSequencerOptions = {
  bpm: number
  bars: number
  isPlaying: boolean
  loop?: boolean // default: true
  rows?: number // number of instrument rows
  stepsPerBeat?: number // default: 4 (16 steps per bar)
  onStep?: (row: number, step: number) => void
  onStop?: () => void // called when playback stops (non-loop mode)
}

export function useStepSequencer({
  bpm,
  bars,
  isPlaying,
  loop = true,
  rows = 8,
  stepsPerBeat = 4,
  onStep,
  onStop,
}: StepSequencerOptions) {
  const totalSteps = bars * stepsPerBeat

  const [grid, setGrid] = useState<boolean[][]>(() =>
    Array.from({ length: rows }, () =>
      Array.from({ length: totalSteps }, () => false)
    )
  )
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const stepRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const gridRef = useRef(grid)
  const onStepRef = useRef(onStep)
  const onStopRef = useRef(onStop)

  // Keep refs in sync
  useEffect(() => {
    gridRef.current = grid
  }, [grid])

  useEffect(() => {
    onStepRef.current = onStep
  }, [onStep])

  useEffect(() => {
    onStopRef.current = onStop
  }, [onStop])

  // Resize grid when totalSteps changes
  useEffect(() => {
    setGrid((prev) =>
      prev.map((row) => {
        const next = [...row]
        next.length = totalSteps
        return Array.from({ length: totalSteps }, (_, i) => next[i] || false)
      })
    )
  }, [totalSteps])

  // Resize grid when rows changes
  useEffect(() => {
    setGrid((prev) => {
      const newGrid = Array.from({ length: rows }, (_, rowIdx) => {
        // Keep existing row if it exists, otherwise create new empty row
        return prev[rowIdx] ? [...prev[rowIdx]] : Array.from({ length: totalSteps }, () => false)
      })
      return newGrid
    })
  }, [rows, totalSteps])

  const toggleStep = useCallback((row: number, step: number) => {
    setGrid((prev) => {
      const updated = prev.map((r) => [...r])
      updated[row][step] = !updated[row][step]
      return updated
    })
  }, [])

  useEffect(() => {
    // Always clear existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!isPlaying) {
      setCurrentStep(-1)
      stepRef.current = 0
      return
    }

    const interval = 60000 / (bpm * stepsPerBeat)
    stepRef.current = 0
    setCurrentStep(0)

    intervalRef.current = setInterval(() => {
      const step = stepRef.current
      const grid = gridRef.current
      const currentTotalSteps = bars * stepsPerBeat

      setCurrentStep(step)

      grid.forEach((row, rowIdx) => {
        if (row[step] && onStepRef.current) {
          onStepRef.current(rowIdx, step)
        }
      })

      const nextStep = step + 1
      if (nextStep >= currentTotalSteps) {
        if (loop) {
          stepRef.current = 0 // Loop back to start
        } else {
          // Stop playing when reaching the end
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          setCurrentStep(-1)
          stepRef.current = 0
          if (onStopRef.current) onStopRef.current()
          return
        }
      } else {
        stepRef.current = nextStep
      }
    }, interval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [bpm, isPlaying, bars, stepsPerBeat, loop])

  const setGridPattern = useCallback((newGrid: boolean[][]) => {
    setGrid(newGrid)
  }, [])

  return {
    grid,
    currentStep,
    toggleStep,
    setGridPattern,
    stepsPerBar: stepsPerBeat,
    totalSteps,
  }
}