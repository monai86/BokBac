import React from 'react'

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export const Logo: React.FC<LogoProps> = ({ size = 24, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="logo-top-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="60%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
        <linearGradient id="logo-bottom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="30%" stop-color="#06b6d4" />
          <stop offset="70%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#84cc16" />
        </linearGradient>
      </defs>

      {/* Cyan Dot */}
      <circle cx="26" cy="50" r="7" fill="#22d3ee" />

      {/* Top Hook */}
      <path
        d="M 26,20 L 56,20 A 15,15 0 0 1 71,35 A 15,15 0 0 1 63.5,48"
        fill="none"
        stroke="url(#logo-top-gradient)"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* Bottom Hook */}
      <path
        d="M 44,50 L 56,50 A 15,15 0 0 1 71,65 A 15,15 0 0 1 56,80 L 38,80"
        fill="none"
        stroke="url(#logo-bottom-gradient)"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  )
}
