"use client"

import { MidiDeviceSelect } from "./MidiDeviceSelect"

type CompactControlsProps = {
  bpm: number
  setBpm: (bpm: number) => void
  bars: number
  setBars: (bars: number) => void
  loop: boolean
  setLoop: (loop: boolean) => void
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  metronomeEnabled: boolean
  setMetronomeEnabled: (enabled: boolean) => void
  triggerMode: 'gate' | 'trigger'
  setTriggerMode: (mode: 'gate' | 'trigger') => void
  gateLength: number
  setGateLength: (length: number) => void
  outputs: MIDIOutput[]
  selectedOutput: MIDIOutput | null
  onSelectOutput: (id: string) => void
}

export function CompactControls({
  bpm,
  setBpm,
  bars,
  setBars,
  loop,
  setLoop,
  isPlaying,
  onPlay,
  onStop,
  metronomeEnabled,
  setMetronomeEnabled,
  triggerMode,
  setTriggerMode,
  gateLength,
  setGateLength,
  outputs,
  selectedOutput,
  onSelectOutput
}: CompactControlsProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 p-3 border-b bg-neutral-50 dark:bg-neutral-900">
      {/* Left: Transport and Timing Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">BPM</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-16 text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            min="60"
            max="200"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Bars</label>
          <input
            type="number"
            value={bars}
            onChange={(e) => setBars(Number(e.target.value))}
            className="w-12 text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            min="1"
            max="4"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Loop</label>
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Click</label>
          <input
            type="checkbox"
            checked={metronomeEnabled}
            onChange={(e) => setMetronomeEnabled(e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Mode</label>
          <select
            value={triggerMode}
            onChange={(e) => setTriggerMode(e.target.value as 'gate' | 'trigger')}
            className="text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="gate">Gate</option>
            <option value="trigger">Trigger</option>
          </select>
        </div>

        {triggerMode === 'gate' && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Gate</label>
            <input
              type="number"
              value={gateLength}
              onChange={(e) => setGateLength(Number(e.target.value))}
              className="w-16 text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              min="10"
              max="2000"
              step="10"
            />
            <span className="text-xs text-neutral-600">ms</span>
          </div>
        )}
      </div>

      {/* Center: Playback Controls */}
      <div className="flex gap-2">
        <button
          onClick={onPlay}
          disabled={isPlaying}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
        >
          Play
        </button>
        <button
          onClick={onStop}
          disabled={!isPlaying}
          className="bg-red-400 hover:bg-red-500 disabled:bg-red-300 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
        >
          Stop
        </button>
      </div>

      {/* Right: MIDI Device */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">MIDI Out</label>
        <MidiDeviceSelect
          outputs={outputs}
          selected={selectedOutput}
          onSelect={onSelectOutput}
        />
      </div>
    </div>
  )
}