import React from "react";

interface AgentAvatarProps {
  className?: string;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({
  className = "w-16 h-16",
}) => {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  const highlightId = `highlight-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${className} rounded-full overflow-hidden`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <radialGradient id={highlightId} cx="30%" cy="30%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base circle */}
        <circle cx="32" cy="32" r="32" fill={`url(#${gradientId})`} />

        {/* Highlight effect */}
        <circle cx="32" cy="32" r="32" fill={`url(#${highlightId})`} />

        {/* Inner swirl pattern */}
        <path
          d="M20 20 Q32 15 44 20 Q50 32 44 44 Q32 49 20 44 Q15 32 20 20 Z"
          fill="rgba(255,255,255,0.1)"
        />
        <path
          d="M25 25 Q32 22 39 25 Q42 32 39 39 Q32 42 25 39 Q22 32 25 25 Z"
          fill="rgba(255,255,255,0.05)"
        />
      </svg>
    </div>
  );
};

export default AgentAvatar;
