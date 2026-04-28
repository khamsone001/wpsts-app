// Server Configuration - Using Local as Primary
const SERVERS = {
    RENDER: 'https://wpsts-backend-007.onrender.com/api',
    VERCEL: 'https://wpsts-backend002.vercel.app/api',
    RAILWAY: 'https://wpsts04-production.up.railway.app/api',
    LOCAL: 'http://192.168.100.19:5000/api'
};

// Proxy service for bypassing network restrictions
export const PROXY_BASE_URL = 'https://api.allorigins.win/raw?url=';

// Check if should use proxy (for production)
export const USE_PROXY = false;

// Current active server and discovery promise
let activeServer = null;
let discoveryPromise = null;

// Function to get active server - use local for development
export const getActiveServer = async () => {
    return SERVERS.LOCAL;
};

// Get full URL with proxy if needed
export const getFullUrl = (endpoint, baseUrl) => {
    if (USE_PROXY) {
        return `${PROXY_BASE_URL}${encodeURIComponent(baseUrl + endpoint)}`;
    }
    return baseUrl + endpoint;
};

// Reset for switching
export const resetActiveServer = () => { activeServer = null; discoveryPromise = null; };

// Legacy export
export const API_BASE_URL = SERVERS.VERCEL;
