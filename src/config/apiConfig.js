// Server Configuration with Automatic Fallback
const SERVERS = {
    VERCEL: 'https://wpsts-backend002.vercel.app/api',
    RAILWAY: 'https://wpsts04-production.up.railway.app/api',
    RENDER: 'https://wpsts-backend-007.onrender.com/api',
    LOCAL: 'http://10.79.97.72:5000/api'
};

// Current active server (will be set dynamically)
let activeServer = null;

// Function to test server availability
const testServer = async (url) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(url.replace('/api', '/'), {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Function to get available server
export const getActiveServer = async () => {
    // 0. Production Bypass: Always use Vercel in production APK
    if (!__DEV__) {
        console.log('[Server] Production Build: Directing to Vercel');
        return SERVERS.VERCEL;
    }

    if (activeServer) {
        return activeServer;
    }

    // 1. Try Vercel (First Priority)
    console.log('[Server] Testing Vercel Server...');
    const vercelAvailable = await testServer(SERVERS.VERCEL);
    if (vercelAvailable) {
        console.log('[Server] ✅ Using Vercel');
        activeServer = SERVERS.VERCEL;
        return activeServer;
    }

    /* 
    // 2. Try Railway (Secondary)
    console.log('[Server] Testing Railway Server...');
    const railwayAvailable = await testServer(SERVERS.RAILWAY);
    if (railwayAvailable) {
        console.log('[Server] ✅ Using Railway');
        activeServer = SERVERS.RAILWAY;
        return activeServer;
    }

    // 3. Try Render
    console.log('[Server] Testing Render Server...');
    const renderAvailable = await testServer(SERVERS.RENDER);
    if (renderAvailable) {
        console.log('[Server] ✅ Using Render');
        activeServer = SERVERS.RENDER;
        return activeServer;
    }
    */

    // 4. Try Local Server (Development)
    console.log('[Server] Testing Local Server...');
    const localAvailable = await testServer(SERVERS.LOCAL);
    if (localAvailable) {
        console.log('[Server] ✅ Using Local Server');
        activeServer = SERVERS.LOCAL;
        return activeServer;
    }

    // All failed
    console.log('[Server] ❌ All servers unavailable');
    throw new Error('ไม่สามารถเชื่อมต่อกับ Server ได้');
};

// Reset active server (for retry)
export const resetActiveServer = () => {
    activeServer = null;
};

// Legacy export for compatibility
export const API_BASE_URL = SERVERS.LOCAL; // Default fallback

