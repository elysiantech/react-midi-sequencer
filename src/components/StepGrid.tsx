import React, { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ScrollContainer } from "@/components/ScrollContainer"

export type RowMeta = {
  label?: string
  renderMeta?: React.ReactNode
  trigger?: () => void
}

export type StepGridProps = {
  grid: boolean[][]
  toggleStep: (row: number, step: number) => void
  rowMeta?: RowMeta[]
  currentStep: number
}

export function StepGrid({
  grid,
  toggleStep,
  rowMeta = [],
  currentStep,
}: StepGridProps) {
  const [flashingCells, setFlashingCells] = useState<Set<string>>(new Set())

  const handleCellClick = useCallback((rowIdx: number, stepIdx: number) => {
    toggleStep(rowIdx, stepIdx)

    const cellKey = `${rowIdx}-${stepIdx}`
    setFlashingCells(prev => new Set(prev).add(cellKey))

    setTimeout(() => {
      setFlashingCells(prev => {
        const next = new Set(prev)
        next.delete(cellKey)
        return next
      })
    }, 150)
  }, [toggleStep])

  const totalSteps = grid[0]?.length ?? 0
  // const bars = Math.ceil(totalSteps / 4)

  return (
    <ScrollContainer>
      <table className="text-sm border-separate border-spacing-0" style={{ width: 'auto' }}>
        <thead>
          <tr>
            <th className="px-2 py-1 text-left text-xs">Track</th>
            {Array.from({ length: totalSteps }, (_, i) => {
              const beat = (i % 4) + 1
              const bar = Math.floor(i / 4) + 1
              const isCurrentStep = i === currentStep
              const isDownbeat = i % 4 === 0
              
              return (
                <th
                  key={i}
                  className={cn(
                    "h-6 text-xs text-center relative px-1",
                    isCurrentStep ? "bg-blue-500 text-white font-bold" : "bg-neutral-100",
                    isDownbeat && "font-bold border-l-2 border-neutral-400"
                  )}
                  style={{ width: '48px', minWidth: '48px' }}
                  title={`Bar ${bar}, Beat ${beat} (Step ${i + 1})`}
                >
                  {isDownbeat ? bar : beat}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="px-2 py-1 text-xs whitespace-nowrap">
                {rowMeta[rowIdx]?.label ?? `Row ${rowIdx + 1}`}
                {rowMeta[rowIdx]?.renderMeta}
              </td>
              {row.map((active, stepIdx) => {
                const cellKey = `${rowIdx}-${stepIdx}`
                const isFlashing = flashingCells.has(cellKey)
                const isCurrent = currentStep === stepIdx

                return (
                  <td
                    key={stepIdx}
                    className={cn(
                      "cursor-pointer h-6 transition-all duration-100 relative border",
                      active ? "bg-green-400" : "bg-neutral-50 hover:bg-neutral-200",
                      isCurrent && "border-blue-500 border-2",
                      isFlashing && "bg-yellow-400 animate-pulse"
                    )}
                    style={{ width: '48px', minWidth: '48px' }}
                    onClick={() => handleCellClick(rowIdx, stepIdx)}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollContainer>
  )
}