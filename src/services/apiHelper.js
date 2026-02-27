import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveServer, resetActiveServer } from '../config/apiConfig';
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
    const MAX_RETRIES = 1; // Lower retries when using offline logic to fail faster to offline mode
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            const API_BASE_URL = await getActiveServer();
            console.log(`[API] Fetching: ${endpoint}`);

            const fetchPromise = fetch(`${API_BASE_URL}${endpoint}`, config);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request Timeout')), 8000) // Lower timeout for better UX
            );

            const response = await Promise.race([fetchPromise, timeoutPromise]);

            // Handle non-JSON responses (like Railway/Render HTML error pages)
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // If it's not JSON, it might be an HTML error page
                const text = await response.text();
                console.log(`[API] Non-JSON response received: ${text.substring(0, 100)}...`);
                throw new Error(`Server Error (${response.status}): ระบบขัดข้องกรุณาลองใหม่ภายหลัง`);
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
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            throw error;
        }
    }
};
