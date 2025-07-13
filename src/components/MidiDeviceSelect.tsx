import React from "react"

type MidiDeviceSelectProps = {
  outputs: MIDIOutput[]
  selected: MIDIOutput | null
  onSelect: (id: string) => void
}

export function MidiDeviceSelect({ outputs, selected, onSelect }: MidiDeviceSelectProps) {
  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={selected?.id || ""}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="" disabled>
        Select MIDI Output
      </option>
      {outputs.map((output) => (
        <option key={output.id} value={output.id}>
          {output.name}
        </option>
      ))}
    </select>
  )
}
