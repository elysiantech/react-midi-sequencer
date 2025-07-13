"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface MidiClockStatusProps {
  isClockRunning: boolean
  tickCount: number
  averageDrift: number
  bpm: number
}

export function MidiClockStatus({ 
  isClockRunning, 
  tickCount, 
  averageDrift, 
  bpm 
}: MidiClockStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const expectedInterval = 60000 / (bpm * 24)
  
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border rounded-md">
      {/* Collapsed Header */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">MIDI Clock</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className={`font-mono ${isClockRunning ? 'text-green-600' : 'text-red-600'}`}>
            {isClockRunning ? 'Running' : 'Stopped'}
          </div>
          <div className="font-mono text-neutral-600">
            {tickCount} ticks
          </div>
          <div className={`font-mono ${averageDrift > 3 ? 'text-yellow-600' : 'text-green-600'}`}>
            {averageDrift.toFixed(1)}ms drift
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t p-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-neutral-600 dark:text-neutral-400">Status</div>
              <div className={`font-mono ${isClockRunning ? 'text-green-600' : 'text-red-600'}`}>
                {isClockRunning ? 'Running' : 'Stopped'}
              </div>
            </div>
            <div>
              <div className="text-neutral-600 dark:text-neutral-400">Tick Count</div>
              <div className="font-mono">{tickCount}</div>
            </div>
            <div>
              <div className="text-neutral-600 dark:text-neutral-400">Expected Interval</div>
              <div className="font-mono">{expectedInterval.toFixed(2)}ms</div>
            </div>
            <div>
              <div className="text-neutral-600 dark:text-neutral-400">Average Drift</div>
              <div className={`font-mono ${averageDrift > 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                {averageDrift.toFixed(3)}ms
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            Clock sends 24 ticks per quarter note for precise hardware sync
          </div>
        </div>
      )}
    </div>
  )
}