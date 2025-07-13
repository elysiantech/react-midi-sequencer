"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

type DebugPanelProps = {
  currentStep: number
  bpm: number
  bars: number
  isPlaying: boolean
  selectedOutput: MIDIOutput | null
  tickCount?: number
  averageDrift?: number
  isClockRunning?: boolean
}

export function DebugPanel({
  currentStep,
  bpm,
  bars,
  isPlaying,
  selectedOutput,
  tickCount = 0,
  averageDrift = 0,
  isClockRunning = false
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const totalSteps = 16 * bars

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-lg z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 w-full"
      >
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        Debug Panel
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="border-t border-neutral-200 dark:border-neutral-600 p-3 text-xs space-y-2 min-w-48">
          {/* Sequencer Status */}
          <div className="space-y-1">
            <div className="font-medium text-neutral-800 dark:text-neutral-200">Sequencer</div>
            <div className="grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400">
              <div>Status: <span className={isPlaying ? "text-green-600" : "text-red-600"}>
                {isPlaying ? "Playing" : "Stopped"}
              </span></div>
              <div>Step: {currentStep + 1}/{totalSteps}</div>
              <div>BPM: {bpm}</div>
              <div>Bars: {bars}</div>
            </div>
          </div>

          {/* MIDI Status */}
          <div className="space-y-1">
            <div className="font-medium text-neutral-800 dark:text-neutral-200">MIDI</div>
            <div className="text-neutral-600 dark:text-neutral-400">
              <div>Device: {selectedOutput ? (
                <span className="text-green-600">{selectedOutput.name}</span>
              ) : (
                <span className="text-red-600">Not connected</span>
              )}</div>
              
              {selectedOutput && (
                <>
                  <div>Clock: <span className={isClockRunning ? "text-green-600" : "text-red-600"}>
                    {isClockRunning ? "Running" : "Stopped"}
                  </span></div>
                  <div>Ticks: {tickCount}</div>
                  <div>Drift: {averageDrift.toFixed(2)}ms</div>
                </>
              )}
            </div>
          </div>

          {/* Timing Info */}
          <div className="space-y-1">
            <div className="font-medium text-neutral-800 dark:text-neutral-200">Timing</div>
            <div className="text-neutral-600 dark:text-neutral-400">
              <div>16th interval: {((60_000 / bpm) / 4).toFixed(1)}ms</div>
              <div>Quarter interval: {(60_000 / bpm).toFixed(1)}ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}