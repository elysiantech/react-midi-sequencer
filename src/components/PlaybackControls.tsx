import React from "react"

type PlaybackControlsProps = {
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
}

export function PlaybackControls({ isPlaying, onPlay, onStop }: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPlay}
        disabled={isPlaying}
        className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        Play
      </button>
      <button
        onClick={onStop}
        disabled={!isPlaying}
        className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
      >
        Stop
      </button>
    </div>
  )
}
