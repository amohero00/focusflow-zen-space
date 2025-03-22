
import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="url(#paint0_linear_logo)"
        className="animate-pulse-slow"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 10C13.2386 10 11 12.2386 11 15C11 17.7614 13.2386 20 16 20C18.7614 20 21 17.7614 21 15C21 12.2386 18.7614 10 16 10ZM9 15C9 11.134 12.134 8 16 8C19.866 8 23 11.134 23 15C23 18.866 19.866 22 16 22C12.134 22 9 18.866 9 15Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 13C16.5523 13 17 13.4477 17 14V15.5858L18.4142 17C18.8047 17.3905 18.8047 18.0237 18.4142 18.4142C18.0237 18.8047 17.3905 18.8047 17 18.4142L15.2929 16.7071C15.1054 16.5196 15 16.2652 15 16V14C15 13.4477 15.4477 13 16 13Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_logo"
          x1="2"
          y1="2"
          x2="30"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const LogoText: React.FC<LogoProps & { showTagline?: boolean }> = ({
  className,
  size = 32,
  showTagline = false
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Logo size={size} />
      <div className="ml-2">
        <h1 className="font-display font-semibold text-lg leading-none">
          FocusFlow
        </h1>
        {showTagline && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Productivity Suite
          </p>
        )}
      </div>
    </div>
  );
};
