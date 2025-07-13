import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StepperControl } from "@/components/StepperControl"
import { formatMidiNote } from "@/lib/midiUtils"

export function InstrumentEditor({
  value,
  onChange,
  darkMode = false
}: {
  value: { channel: number; note: number; velocity: number; sendNoteOff: boolean }
  onChange: (updated: { channel: number; note: number; velocity: number; sendNoteOff: boolean }) => void
  darkMode?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>CH</span>
      <StepperControl
        value={value.channel}
        onChange={(channel) => onChange({ ...value, channel })}
        min={1}
        max={16}
        className="w-8"
      />
      <Select
        value={value.note.toString()}
        onValueChange={(noteStr) => onChange({ ...value, note: parseInt(noteStr) })}
      >
        <SelectTrigger className={`h-6 w-[80px] text-xs px-1 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
          <SelectValue>
            {formatMidiNote(value.note)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className={`max-h-60 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}>
          {Array.from({ length: 128 }, (_, i) => (
            <SelectItem key={i} value={i.toString()} className={darkMode ? 'text-white hover:bg-gray-700 focus:bg-gray-700' : 'text-black hover:bg-gray-100 focus:bg-gray-100'}>
              {formatMidiNote(i)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vel</span>
      <input
        type="range"
        min="0"
        max="127"
        value={value.velocity}
        onChange={(e) => onChange({ ...value, velocity: parseInt(e.target.value) })}
        className={`w-12 h-6 ${darkMode ? 'accent-blue-500' : 'accent-blue-600'}`}
        title={`Velocity: ${value.velocity}`}
      />
      <span className={`text-xs w-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {value.velocity}
      </span>
      
      <label className="flex items-center" title="Send note off">
        <input
          type="checkbox"
          checked={value.sendNoteOff}
          onChange={(e) => onChange({ ...value, sendNoteOff: e.target.checked })}
          className="w-3 h-3"
        />
        <span className={`text-xs ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>↘</span>
      </label>
    </div>
  )
}