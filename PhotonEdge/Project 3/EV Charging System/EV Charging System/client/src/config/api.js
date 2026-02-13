// API Configuration with Auto-Discovery and Retry
const POSSIBLE_BACKEND_URLS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000'
];

let discoveredBackendURL = null;

/**
 * Auto-discover which backend port is actually running
 */
export async function discoverBackendURL() {
    if (discoveredBackendURL) {
        return discoveredBackendURL;
    }

    console.log('🔍 Auto-discovering backend server...');

    for (const url of POSSIBLE_BACKEND_URLS) {
        try {
            const response = await fetch(`${url}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000) // 2 second timeout
            });

            if (response.ok) {
                discoveredBackendURL = url;
                console.log(`✅ Backend found at: ${url}`);
                return url;
            }
        } catch (error) {
            // Continue to next URL
            console.log(`⚠️  ${url} not available, trying next...`);
        }
    }

    // Fallback to default
    console.warn('⚠️  Could not auto-discover backend, using default: ' + POSSIBLE_BACKEND_URLS[0]);
    discoveredBackendURL = POSSIBLE_BACKEND_URLS[0];
    return discoveredBackendURL;
}

/**
 * Get the current backend base URL
 */
export function getBackendURL() {
    return discoveredBackendURL || POSSIBLE_BACKEND_URLS[0];
}

/**
 * Get Socket.IO URL (same as backend URL)
 */
export function getSocketURL() {
    return getBackendURL();
}

export default {
    discoverBackendURL,
    getBackendURL,
    getSocketURL
};
