import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium tracking-wide">Loading workspace...</p>
      </div>
    </div>
  );
}
