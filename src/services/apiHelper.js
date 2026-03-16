import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveServer, getFullUrl, USE_PROXY, resetActiveServer } from '../config/apiConfig';
import { OfflineManager } from './offlineManager';

export const apiRequest = async (endpoint, method = 'GET', body = null, skipQueue = false) => {
    // 1. Check for cached data first if it's a GET request
    if (method === 'GET') {
        const cached = await OfflineManager.getCachedData(endpoint);
        // If we want to return cache immediately while fetching (SWR pattern), we'd need a callback.
        // For now, we only use cache if fetch fails.
    }

    const token = await AsyncStorage.getItem('userToken');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    // Trigger sync in background if online (don't await to avoid blocking)
    if (!skipQueue) {
        OfflineManager.syncQueue(apiRequest).catch(console.error);
    }

    // Retry configuration
    const MAX_RETRIES = 3; // Reduced for Vercel, which has faster cold starts
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            const API_BASE_URL = await getActiveServer();
            const fullUrl = getFullUrl(endpoint, API_BASE_URL);
            console.log(`[API] Fetching: ${fullUrl} (${method})${USE_PROXY ? ' [PROXY]' : ''}`);

            const fetchPromise = fetch(fullUrl, config);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Server responding with timeout (starting)')), 45000) // 45s timeout for Render cold start
            );

            const response = await Promise.race([fetchPromise, timeoutPromise]);

            let data;

            // Handle proxy response (allorigins wraps the response)
            if (USE_PROXY) {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.log(`[API] Proxy returned non-JSON: ${text.substring(0, 100)}...`);
                    throw new Error(`Server Error: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้`);
                }
            } else {
                // Handle non-JSON responses (like Railway/Render HTML error pages)
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    // If it's not JSON, it might be an HTML error page
                    const text = await response.text();
                    console.log(`[API] Non-JSON response received: ${text.substring(0, 100)}...`);
                    throw new Error(`Server Error (${response.status}): ระบบขัดข้องกรุณาลองใหม่ภายหลัง`);
                }
            }

            if (!response.ok) {
                throw new Error(data.message || 'An API error occurred');
            }

            // If GET, update cache
            if (method === 'GET') {
                await OfflineManager.cacheData(endpoint, data);
            }

            return data;
        } catch (error) {
            attempts++;
            console.log(`[API] Attempt ${attempts} failed for ${endpoint}:`, error.message);

            // If it's the last attempt and it failed
            if (attempts === MAX_RETRIES) {
                // HANDLE OFFLINE
                if (method === 'GET') {
                    const cachedData = await OfflineManager.getCachedData(endpoint);
                    if (cachedData) {
                        console.log(`[Offline] Returning cached data for ${endpoint}`);
                        return cachedData;
                    }
                } else if (!skipQueue) {
                    // Save mutation to queue
                    await OfflineManager.saveToQueue({ endpoint, method, body });
                    return { success: true, offline: true, message: 'บันทึกข้อมูลในเครื่องแล้ว (จะอัปโหลดเมื่อออนไลน์)' };
                }
            }

            if (attempts < MAX_RETRIES) {
                // Wait longer if network request failed (likely OkHttp 10s timeout while server sleeps)
                const isNetworkError = error.message.includes('Network request failed') || error.message.includes('fetch');
                const delayMs = isNetworkError ? 3000 : 1000;
                console.log(`[API] Waiting ${delayMs}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                continue;
            }

            throw error;
        }
    }
};
