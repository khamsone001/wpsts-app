import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@api_sync_queue';
const CACHE_PREFIX = '@api_cache_';

export const OfflineManager = {
    // 1. Queue Management for Mutations (POST, PUT, DELETE)
    saveToQueue: async (request) => {
        try {
            const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
            const queue = existingQueue ? JSON.parse(existingQueue) : [];

            // Add unique ID and timestamp
            const queueItem = {
                ...request,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            };

            queue.push(queueItem);
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            console.log('[Offline] Request saved to queue:', request.endpoint);
            return true;
        } catch (error) {
            console.error('[Offline] Error saving to queue:', error);
            return false;
        }
    },

    getQueue: async () => {
        try {
            const queue = await AsyncStorage.getItem(QUEUE_KEY);
            return queue ? JSON.parse(queue) : [];
        } catch (e) { return []; }
    },

    getQueueLength: async () => {
        const queue = await OfflineManager.getQueue();
        return queue.length;
    },

    removeFromQueue: async (id) => {
        const queue = await OfflineManager.getQueue();
        const newQueue = queue.filter(item => item.id !== id);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    },

    // 2. Data Caching for GET requests
    cacheData: async (endpoint, data) => {
        try {
            const cacheKey = `${CACHE_PREFIX}${endpoint}`;
            await AsyncStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('[Offline] Error caching data:', error);
        }
    },

    getCachedData: async (endpoint) => {
        try {
            const cacheKey = `${CACHE_PREFIX}${endpoint}`;
            const cached = await AsyncStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached).data : null;
        } catch (error) {
            return null;
        }
    },

    // 3. Advanced Cache Helpers for Optimistic UI
    updateCacheItem: async (endpoint, updateFn) => {
        try {
            const currentData = await OfflineManager.getCachedData(endpoint);
            if (currentData) {
                const newData = updateFn(currentData);
                await OfflineManager.cacheData(endpoint, newData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Offline] Error updating cache item:', error);
            return false;
        }
    },

    getCacheKey: (endpoint) => `${CACHE_PREFIX}${endpoint}`,

    // 4. Background Sync Sync Initialization
    // This will be called when online
    syncQueue: async (apiRequestFunc) => {
        const queue = await OfflineManager.getQueue();
        if (queue.length === 0) return;

        console.log(`[Offline] Starting sync for ${queue.length} items...`);

        for (const item of queue) {
            try {
                // Try to send the request again
                await apiRequestFunc(item.endpoint, item.method, item.body, true); // true = skipQueue
                await OfflineManager.removeFromQueue(item.id);
                console.log(`[Offline] Successfully synced: ${item.endpoint}`);
            } catch (error) {
                console.log(`[Offline] Sync failed for ${item.endpoint}, will retry later.`);
                // Keep in queue and stop processing to maintain order if necessary
                break;
            }
        }
    }
};
