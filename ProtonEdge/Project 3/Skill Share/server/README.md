# SkillSwap Backend Setup Instructions

## Quick Start

### 1. Copy Your API Key to Backend
Copy your existing `.env.local` file from the root to the `server` directory:
```powershell
Copy-Item .env.local server\.env.local
```

Or manually create `server\.env.local` with:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
```

### 2. Install Backend Dependencies
```powershell
cd server
npm install
```

### 3. Update Root `.env.local`
Add this line to your root `.env.local` file:
```
VITE_BACKEND_URL=http://localhost:3001
```

### 4. Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd server
npm start
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

## What Changed?

✅ **Backend Created**: New `server/` directory with Express API
✅ **Frontend Updated**: Now calls backend instead of Gemini directly  
✅ **API Key Secured**: No longer exposed in client-side bundle
✅ **TypeScript Fixed**: Added proper type definitions

## Verification

1. Backend should start on `http://localhost:3001`
2. Frontend should start on `http://localhost:3000`
3. Check browser DevTools Network tab - you should see calls to `localhost:3001/api/*`
4. No API key should be visible in browser source code

## Note on LiveSession Component

The `LiveSession.tsx` component still uses direct Gemini API connection for real-time streaming. This is a known limitation that would require WebSocket proxy implementation to fully secure.
