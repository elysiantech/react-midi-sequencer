import { useEffect, useState, useRef } from "react"

type MidiMessage = {
  timestamp: number
  command: string
  note: number
  velocity: number
  channel: number
  direction: 'in' | 'out'
}

export function useMidiOutput() {
  const [outputs, setOutputs] = useState<MIDIOutput[]>([])
  const [inputs, setInputs] = useState<MIDIInput[]>([])
  const [selectedOutputId, setSelectedOutputId] = useState<string | null>(null)
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null)
  const [lastMessages, setLastMessages] = useState<MidiMessage[]>([])
  const activeNotesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!navigator.requestMIDIAccess) return

    navigator.requestMIDIAccess({ sysex: false }).then((access) => {
      setOutputs(Array.from(access.outputs.values()))
      setInputs(Array.from(access.inputs.values()))

      // Set up input listeners
      access.inputs.forEach((input) => {
        input.onmidimessage = handleMidiInput
      })

      access.onstatechange = () => {
        setOutputs(Array.from(access.outputs.values()))
        setInputs(Array.from(access.inputs.values()))
        
        // Re-setup input listeners for new devices
        access.inputs.forEach((input) => {
          input.onmidimessage = handleMidiInput
        })
      }
    })
  }, [])

  const selectedOutput = outputs.find((o) => o.id === selectedOutputId) || null
  const selectedInput = inputs.find((i) => i.id === selectedInputId) || null

  const selectOutput = (id: string) => {
    setSelectedOutputId(id)
  }

  const selectInput = (id: string) => {
    setSelectedInputId(id)
  }

  const handleMidiInput = (event: MIDIMessageEvent) => {
    const [status, note, velocity] = event.data
    const command = (status & 0xF0) === 0x90 ? 'Note On' : (status & 0xF0) === 0x80 ? 'Note Off' : 'Unknown'
    const channel = (status & 0x0F) + 1
    
    logMidiMessage(command, note || 0, velocity || 0, channel, 'in')
  }

  const logMidiMessage = (command: string, note: number, velocity: number, channel: number, direction: 'in' | 'out' = 'out') => {
    const message: MidiMessage = {
      timestamp: Date.now(),
      command,
      note,
      velocity,
      channel,
      direction
    }
    setLastMessages(prev => [message, ...prev.slice(0, 9)]) // Keep last 10 messages
  }

  const sendNote = (note: number, channel: number, triggerMode: 'gate' | 'trigger' = 'gate', velocity: number = 100) => {
    if (!selectedOutput) return

    const noteOn = 0x90 + ((channel - 1) & 0x0f)
    const noteOff = 0x80 + ((channel - 1) & 0x0f)
    const noteKey = `${note}-${channel}`

    // Send note on
    selectedOutput.send([noteOn, note, velocity])
    logMidiMessage('Note On', note, velocity, channel, 'out')
    activeNotesRef.current.add(noteKey)
    
    if (triggerMode === 'gate') {
      // Gate mode: Send note off after 100ms
      setTimeout(() => {
        selectedOutput.send([noteOff, note, 0])
        logMidiMessage('Note Off', note, 0, channel, 'out')
        activeNotesRef.current.delete(noteKey)
      }, 100)
    }
    // Trigger mode: Don't send note off - let the hardware handle it
  }

  const stopAllNotes = () => {
    if (!selectedOutput) return
    
    // Send note off for all possible notes on all channels (brute force panic)
    for (let channel = 1; channel <= 16; channel++) {
      const noteOff = 0x80 + ((channel - 1) & 0x0f)
      
      // Send note off for all 128 MIDI notes on this channel
      for (let note = 0; note < 128; note++) {
        selectedOutput.send([noteOff, note, 0])
      }
      
      // Also send MIDI CC messages for panic
      selectedOutput.send([0xB0 + (channel - 1), 120, 0]) // All Sound Off
      selectedOutput.send([0xB0 + (channel - 1), 123, 0]) // All Notes Off
    }
    
    activeNotesRef.current.clear()
    // Don't log panic messages to avoid cluttering MIDI status
  }

  return {
    outputs,
    inputs,
    selectedOutput,
    selectedInput,
    selectOutput,
    selectInput,
    sendNote,
    stopAllNotes,
    lastMessages,
    activeNotes: activeNotesRef.current.size
  }
}