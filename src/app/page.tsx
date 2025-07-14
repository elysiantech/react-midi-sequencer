"use client"

import { useState, useCallback } from "react"
import { useStepSequencer } from "@/hooks/useStepSequencer"
import { SequencerGrid } from "@/components/SequencerGrid"
import { InstrumentEditor } from "@/components/InstrumentEditor"
import { Metronome } from "@/components/Metronome"
import { useMidiOutput } from "@/hooks/useMidiOutput"

export default function Page() {
  const [bpm, setBpm] = useState(120)
  const [bars, setBars] = useState(4)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [showMidiStatus, setShowMidiStatus] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  const [instrumentMeta, setInstrumentMeta] = useState(() => 
    Array.from({ length: 8 }, (_, row) => ({
      channel: 1,
      note: 24 + row,
      velocity: 100,
      sendNoteOff: true
    }))
  )

  const updateInstrumentMeta = (row: number, updated: { channel: number; note: number; velocity: number; sendNoteOff: boolean }) => {
    setInstrumentMeta(prev => {
      const next = [...prev]
      next[row] = updated
      return next
    })
  }

  const addInstrumentRow = () => {
    setInstrumentMeta(prev => [
      ...prev,
      {
        channel: 1,
        note: 24 + prev.length, // Next note in sequence
        velocity: 100,
        sendNoteOff: true
      }
    ])
  }

  const {
  outputs,
  inputs,
  selectedOutput,
  selectedInput,
  selectOutput,
  selectInput,
  sendNote,
  stopAllNotes,
  lastMessages,
  activeNotes
} = useMidiOutput()

  const handleStep = useCallback((row: number, step: number) => {
    // Get the instrument settings for this row
    const instrument = instrumentMeta[row]
    if (instrument && sendNote) {
      // Use per-row sendNoteOff to determine mode
      const mode = instrument.sendNoteOff ? 'gate' : 'trigger'
      sendNote(instrument.note, instrument.channel, mode, instrument.velocity)
      console.log(`MIDI: Row ${row}, Step ${step} -> Note ${instrument.note} on Channel ${instrument.channel} (${mode}, vel: ${instrument.velocity})`)
    }
  }, [instrumentMeta, sendNote])

  const exportPattern = () => {
    const data = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      settings: {
        bpm,
        bars,
        loop,
        metronomeEnabled,
        darkMode
      },
      instruments: instrumentMeta,
      pattern: grid
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `step-pattern-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importPattern = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        // Validate basic structure
        if (!data.settings || !data.instruments || !data.pattern) {
          alert('Invalid file format')
          return
        }

        // Import settings
        if (data.settings.bpm) setBpm(data.settings.bpm)
        if (data.settings.bars) setBars(data.settings.bars)
        if (typeof data.settings.loop === 'boolean') setLoop(data.settings.loop)
        if (typeof data.settings.metronomeEnabled === 'boolean') setMetronomeEnabled(data.settings.metronomeEnabled)
        if (typeof data.settings.darkMode === 'boolean') setDarkMode(data.settings.darkMode)

        // Import instruments
        setInstrumentMeta(data.instruments)

        // Import grid pattern
        if (data.pattern && Array.isArray(data.pattern)) {
          setGridPattern(data.pattern)
        }
        
        alert('Pattern imported successfully!')
      } catch (error) {
        alert('Error importing file: Invalid JSON')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
  }

  const {
    grid,
    toggleStep,
    currentStep,
    setGridPattern,
    stepsPerBar: _,
    totalSteps
  } = useStepSequencer({
    bpm,
    bars,
    isPlaying,
    loop,
    rows: instrumentMeta.length,
    onStep: handleStep,
    onStop: () => setIsPlaying(false),
  })

  return (
    <div className={`p-4 space-y-4 min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm">BPM:</label>
        <input
          type="number"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className={`border p-1 w-20 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        />

        <label className="text-sm">Bars:</label>
        <select
          value={bars}
          onChange={(e) => setBars(Number(e.target.value))}
          className={`border p-1 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
        >
          {[1, 2, 4, 8, 16].map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <label className="text-sm flex items-center gap-1">
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
          />
          Loop
        </label>

        <label className="text-sm flex items-center gap-1">
          <input
            type="checkbox"
            checked={metronomeEnabled}
            onChange={(e) => setMetronomeEnabled(e.target.checked)}
          />
          Metronome
        </label>


        <label className="text-sm flex items-center gap-1">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          Dark Mode
        </label>

        <button
          onClick={() => {
            setIsPlaying((p) => !p)
            if (isPlaying) {
              // Stop all MIDI notes when stopping sequencer
              stopAllNotes()
            }
          }}
          className={`px-4 py-1 text-white rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>

        <button
          onClick={exportPattern}
          className={`px-3 py-1 text-xs rounded ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
        >
          Export
        </button>

        <label className={`px-3 py-1 text-xs rounded cursor-pointer ${darkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
          Import
          <input
            type="file"
            accept=".json"
            onChange={importPattern}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <div className="flex gap-4">
          <div>
            <label className="text-sm">MIDI Output:</label>
            <select
              className={`border p-1 ml-2 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              value={selectedOutput?.id ?? ""}
              onChange={(e) => selectOutput(e.target.value)}
            >
              <option value="">No Output Device</option>
              {outputs.map((output) => (
                <option key={output.id} value={output.id}>
                  {output.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm">MIDI Input:</label>
            <select
              className={`border p-1 ml-2 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              value={selectedInput?.id ?? ""}
              onChange={(e) => selectInput(e.target.value)}
            >
              <option value="">No Input Device</option>
              {inputs.map((input) => (
                <option key={input.id} value={input.id}>
                  {input.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setShowMidiStatus(!showMidiStatus)}
            className={`ml-4 text-sm underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            {showMidiStatus ? "Hide MIDI Status" : "Show MIDI Status"}
          </button>
        </div>

        {showMidiStatus && (
          <div className={`mt-2 p-2 border text-sm rounded ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-neutral-50 border-gray-300'}`}>
            <div className="grid grid-cols-3 gap-4">
              {/* Device Info */}
              <div>
                <div><strong>Output Device:</strong> {selectedOutput?.name || "None"}</div>
                <div><strong>Input Device:</strong> {selectedInput?.name || "None"}</div>
                <div><strong>Available I/O:</strong> {outputs.length}/{inputs.length}</div>
                <div><strong>Active Notes:</strong> {activeNotes}</div>
              </div>
              
              {/* MIDI Input */}
              <div>
                <div className="font-bold text-green-700 mb-1">MIDI IN</div>
                {(() => {
                  const lastInput = lastMessages.find(msg => msg.direction === 'in')
                  return lastInput ? (
                    <>
                      <div><strong>Command:</strong> {lastInput.command}</div>
                      <div><strong>Note:</strong> {lastInput.note} <strong>Vel:</strong> {lastInput.velocity}</div>
                      <div><strong>Channel:</strong> {lastInput.channel}</div>
                      <div><strong>Time:</strong> {new Date(lastInput.timestamp).toLocaleTimeString()}</div>
                    </>
                  ) : (
                    <>
                      <div><strong>Command:</strong> -</div>
                      <div><strong>Note:</strong> - <strong>Vel:</strong> -</div>
                      <div><strong>Channel:</strong> -</div>
                      <div><strong>Time:</strong> -</div>
                    </>
                  )
                })()}
              </div>
              
              {/* MIDI Output */}
              <div>
                <div className="font-bold text-blue-700 mb-1">MIDI OUT</div>
                {(() => {
                  const lastOutput = lastMessages.find(msg => msg.direction === 'out')
                  return lastOutput ? (
                    <>
                      <div><strong>Command:</strong> {lastOutput.command}</div>
                      <div><strong>Note:</strong> {lastOutput.note} <strong>Vel:</strong> {lastOutput.velocity}</div>
                      <div><strong>Channel:</strong> {lastOutput.channel}</div>
                      <div><strong>Time:</strong> {new Date(lastOutput.timestamp).toLocaleTimeString()}</div>
                    </>
                  ) : (
                    <>
                      <div><strong>Command:</strong> -</div>
                      <div><strong>Note:</strong> - <strong>Vel:</strong> -</div>
                      <div><strong>Channel:</strong> -</div>
                      <div><strong>Time:</strong> -</div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      <SequencerGrid
        grid={grid}
        toggleStep={toggleStep}
        currentColumn={isPlaying ? currentStep : -1}
        totalSteps={totalSteps}
        rowMeta={instrumentMeta}
        renderRowMetaEditor={(row, meta) => (
          <InstrumentEditor
            value={meta}
            onChange={(updated) => updateInstrumentMeta(row, updated)}
            darkMode={darkMode}
          />
        )}
        onAddRow={addInstrumentRow}
        darkMode={darkMode}
      />

      {/* Metronome Component */}
      <Metronome bpm={bpm} isPlaying={metronomeEnabled} />
    </div>
  )
}