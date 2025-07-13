import React from "react"

type ParameterControlsProps = {
  bpm: number
  setBpm: React.Dispatch<React.SetStateAction<number>>
  bars: number
  setBars: React.Dispatch<React.SetStateAction<number>>
  loop: boolean
  setLoop: React.Dispatch<React.SetStateAction<boolean>>
}

export function ParameterControls({ bpm, setBpm, bars, setBars, loop, setLoop }: ParameterControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-1">
        BPM:
        <input
          type="number"
          className="w-20 border px-2 py-1 rounded"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
        />
      </label>
      <label className="flex items-center gap-1">
        Bars:
        <input
          type="number"
          className="w-20 border px-2 py-1 rounded"
          value={bars}
          onChange={(e) => setBars(Number(e.target.value))}
        />
      </label>
      <label className="flex items-center gap-1">
        Loop:
        <input
          type="checkbox"
          checked={loop}
          onChange={(e) => setLoop(e.target.checked)}
        />
      </label>
    </div>
  )
}
