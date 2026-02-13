
import React from 'react';

export const Icons = {
  Home: ({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Search: ({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Chat: ({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Profile: ({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Verified: ({ className = "w-4 h-4" }: { className?: string } = {}) => (
    <svg className={`${className} text-blue-500 inline-block`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.65.26-.89.31-1.84.15-2.76-.23-1.35-1-2.54-2.1-3.27-.8-.52-1.73-.77-2.67-.72-.78.04-1.53.25-2.2.62C12.55 1.42 11.23.5 9.75.5c-1.5 0-2.82.92-3.41 2.25-.66-.36-1.41-.57-2.18-.62-.95-.05-1.88.2-2.68.72-1.1.73-1.87 1.92-2.1 3.27-.16.92-.11 1.87.15 2.76-1.3.7-2.18 2.07-2.18 3.65s.88 2.95 2.18 3.65c-.26.89-.31 1.84-.15 2.76.23 1.35 1 2.54 2.1 3.27.8.52 1.73.77 2.67.72.78-.04 1.53-.25 2.2-.62.59 1.33 1.91 2.25 3.41 2.25 1.48 0 2.8-.92 3.39-2.25.67.37 1.42.58 2.2.62.94.05 1.87-.2 2.67-.72 1.1-.73 1.87-1.92 2.1-3.27.16-.92.11-1.87-.15-2.76 1.3-.7 2.18-2.07 2.18-3.65zM10.11 17l-4.22-4.22 1.41-1.41 2.81 2.81 7.03-7.03 1.41 1.41L10.11 17z" />
    </svg>
  ),
  Star: ({ className = "w-4 h-4" }: { className?: string } = {}) => (
    <svg className={`${className} text-yellow-400 fill-current`} viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Sparkles: ({ className = "w-5 h-5" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
  ),
  Video: ({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
};
