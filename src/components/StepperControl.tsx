"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"

type StepperControlProps = {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  label?: string
  className?: string
}

export function StepperControl({ 
  value, 
  onChange, 
  min, 
  max, 
  label, 
  className 
}: StepperControlProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isHolding, setIsHolding] = useState(false) // eslint-disable-line @typescript-eslint/no-unused-vars
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const increment = useCallback(() => {
    onChange(Math.min(max, value + 1))
  }, [value, max, onChange])

  const decrement = useCallback(() => {
    onChange(Math.max(min, value - 1))
  }, [value, min, onChange])

  const startHolding = useCallback((direction: 'up' | 'down') => {
    setIsHolding(true)
    const action = direction === 'up' ? increment : decrement
    
    // Initial delay before starting rapid fire
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 100) // Repeat every 100ms
    }, 500) // Wait 500ms before starting rapid fire
  }, [increment, decrement])

  const stopHolding = useCallback(() => {
    setIsHolding(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHolding()
    }
  }, [stopHolding])

  // Handle keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      increment()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      decrement()
    }
  }, [increment, decrement])

  return (
    <div 
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        stopHolding()
      }}
    >
      {/* Label */}
      {label && (
        <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
          {label}
        </div>
      )}
      
      {/* Value display */}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = parseInt(e.target.value, 10)
            if (!isNaN(newValue) && newValue >= min && newValue <= max) {
              onChange(newValue)
            }
          }}
          onKeyDown={handleKeyDown}
          className="w-full h-6 px-1 text-xs text-center border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white dark:bg-neutral-800 dark:border-neutral-600"
          min={min}
          max={max}
        />
        
        {/* Stepper arrows - only visible on hover */}
        {isHovered && (
          <div className="absolute right-0 top-0 flex flex-col h-full">
            <button
              className={cn(
                "flex-1 px-1 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 border-l border-neutral-300 dark:border-neutral-600 rounded-tr transition-colors",
                value >= max && "opacity-50 cursor-not-allowed"
              )}
              onClick={increment}
              onMouseDown={() => startHolding('up')}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              disabled={value >= max}
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              className={cn(
                "flex-1 px-1 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 border-l border-t border-neutral-300 dark:border-neutral-600 rounded-br transition-colors",
                value <= min && "opacity-50 cursor-not-allowed"
              )}
              onClick={decrement}
              onMouseDown={() => startHolding('down')}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              disabled={value <= min}
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}