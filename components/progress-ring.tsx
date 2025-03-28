"use client"

import { useEffect, useState } from "react"

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  textClassName?: string
  color?: string
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 4,
  className = "",
  textClassName = "",
  color = "currentColor",
}: ProgressRingProps) {
  const [offset, setOffset] = useState(0)

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  useEffect(() => {
    const progressOffset = ((100 - progress) / 100) * circumference
    setOffset(progressOffset)
  }, [progress, circumference])

  return (
    <div className={`progress-ring-container ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-muted stroke-current"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="progress-ring-circle stroke-current"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className={`progress-ring-text ${textClassName}`}>{progress}%</div>
    </div>
  )
}

