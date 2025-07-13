import React from "react"

export type SequencerGridProps = {
  grid: boolean[][]
  toggleStep: (row: number, col: number) => void
  currentColumn: number
  totalSteps: number
  rowMeta?: any[]
  renderRowMetaEditor?: (row: number, meta: any) => React.ReactNode
  onAddRow?: () => void
  darkMode?: boolean
}

export function SequencerGrid({
  grid,
  toggleStep,
  currentColumn,
  totalSteps,
  rowMeta = [],
  renderRowMetaEditor,
  onAddRow,
  darkMode = false
}: SequencerGridProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table-fixed border-collapse">
        <thead>
          <tr>
            <th className={`px-2 ${darkMode ? 'text-gray-300' : 'text-black'}`}>CH / Note</th>
            {Array.from({ length: totalSteps }, (_, i) => {
              const bar = Math.floor(i / 4) + 1
              const step = (i % 4) + 1
              return (
                <th key={i} className={`w-10 text-xs text-center font-medium ${darkMode ? 'text-gray-300' : 'text-black'}`}>
                  {`${bar}.${step}`}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="pr-2 align-middle">
                {renderRowMetaEditor?.(rowIdx, rowMeta[rowIdx])}
              </td>
              {row.map((cell, colIdx) => (
                <td
                  key={colIdx}
                  className={`w-10 h-10 text-center border cursor-pointer transition-colors ${
                    colIdx === currentColumn 
                      ? (darkMode ? "bg-blue-600" : "bg-blue-200") 
                      : cell 
                      ? (darkMode ? "bg-green-600" : "bg-green-400") 
                      : (darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100")
                  } ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                  onClick={() => toggleStep(rowIdx, colIdx)}
                />
              ))}
            </tr>
          ))}
          {onAddRow && (
            <tr>
              <td className="pr-2 align-middle">
                <button
                  onClick={onAddRow}
                  className={`px-2 py-1 text-xs text-white rounded transition-colors ${
                    darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  title="Add instrument row"
                >
                  +
                </button>
              </td>
              <td colSpan={totalSteps} className={`text-xs italic pl-2 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Click '+' to add another instrument track
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
