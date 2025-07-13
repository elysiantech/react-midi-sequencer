// components/ScrollContainer.tsx
import { ReactNode, useEffect, useRef } from "react"

export function ScrollContainer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  // Optional: Auto-scroll to current step area when grid expands
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollLeft = 0
    }
  }, [])

  return (
    <div
      ref={ref}
      className="overflow-x-auto w-full border rounded-md bg-white dark:bg-neutral-900"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  )
}