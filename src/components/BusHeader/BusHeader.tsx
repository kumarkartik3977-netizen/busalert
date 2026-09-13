"use client";

import React from "react";

interface BusHeaderProps {
  busNumber: string;
  routeName: string;
  onBack?: () => void;
  onShare?: () => void;
  onMenu?: () => void;
}

export default function BusHeader({
  busNumber,
  routeName,
  onBack,
  onShare,
  onMenu,
}: BusHeaderProps) {
  return (
    <header className="w-full bg-primary h-16 flex items-center justify-between px-3">
      {/* Left: Back button */}
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Center: Bus info */}
      <div className="flex flex-col items-center justify-center text-center min-w-0 px-2">
        <span className="text-white font-bold text-base leading-tight truncate">
          Bus #{busNumber}
        </span>
        <span className="text-white/80 text-xs leading-tight truncate max-w-[160px]">
          {routeName}
        </span>
      </div>

      {/* Right: Share + Menu */}
      <div className="flex items-center gap-1">
        <button
          onClick={onShare}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Share"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
        <button
          onClick={onMenu}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
