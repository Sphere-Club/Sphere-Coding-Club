# LiveSession Security Documentation

## ⚠️ Security Warning

The `LiveSession.tsx` component uses Gemini's real-time streaming API, which **requires direct client-side access to the API key**. This creates a security risk.

## Current Status

✅ **DISABLED by default** - The component will not work because `process.env.API_KEY` is undefined (we removed it from `vite.config.ts`)

## Why This Component Can't Use Backend Proxy

The LiveSession feature uses:
- Real-time bidirectional audio/video streaming
- WebRTC media streams
- Direct Gemini Live API connection

These require persistent, low-latency connections that cannot be easily proxied through a traditional REST API backend.

## Options for Using This Feature

### Option 1: Keep Disabled (Current - RECOMMENDED)
- LiveSession feature remains non-functional
- API key stays secure
- No code changes needed

### Option 2: Enable for Development Only
Add to `vite.config.ts` (development only):
```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```
⚠️ **WARNING**: This exposes your API key in the client bundle!

### Option 3: Implement WebSocket Proxy (Future Enhancement)
- Create WebSocket server to proxy Gemini Live API
- Requires significant backend development
- Most secure solution for production

## Recommendations

1. **For Development**: Use Option 2 only on localhost, never deploy
2. **For Production**: Keep disabled (Option 1) or implement WebSocket proxy (Option 3)
3. **For Demo**: Use pre-recorded video or mock the feature

## Code Warnings Added

The component now includes:
- File-level JSDoc warning explaining the security risk
- Inline comment at API key usage point
- Documentation of current disabled status
