"use client"

interface AnimatedGradientTextProps {
  text: string
  className?: string
}

export function AnimatedGradientText({ text, className = "" }: AnimatedGradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-violet-400 bg-clip-text text-transparent ${className}`}
      style={{
        backgroundSize: "200% auto",
        animation: "textShine 3s linear infinite",
      }}
    >
      {text}
      <style jsx>{`
        @keyframes textShine {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </span>
  )
}

