import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Try to find backend port - fallback to 3000
const BACKEND_PORT = process.env.BACKEND_PORT || 3000;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: BACKEND_URL,
                changeOrigin: true,
                secure: false,
                configure: (proxy, options) => {
                    proxy.on('error', (err, req, res) => {
                        console.log('⚠️  Proxy error:', err.message);
                    });
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        console.log('📡 Proxying:', req.method, req.url, '→', options.target);
                    });
                }
            },
            '/socket.io': {
                target: BACKEND_URL,
                changeOrigin: true,
                ws: true, // Enable WebSocket proxying
                secure: false
            }
        }
    }
})
