import { apiRequest } from './apiHelper';
import { OfflineManager } from './offlineManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ROUTINE_CACHE_KEY = '@api_cache_/routines';

const routineService = {
    // Get all routines (Offline-first / SWR Pattern)
    getAllRoutines: async () => {
        try {
            // 1. Try to get from cache first for instant UI
            const cached = await OfflineManager.getCachedData('/routines');

            // 2. Fetch from API in background (or foreground if no cache)
            const fetchPromise = apiRequest('/routines').then(async (routines) => {
                if (routines && Array.isArray(routines)) {
                    await OfflineManager.cacheData('/routines', routines);
                }
                return routines;
            });

            // If we have cache, return it immediately, otherwise wait for fetch
            return cached || await fetchPromise;
        } catch (error) {
            console.error('Error fetching routines:', error);
            return await OfflineManager.getCachedData('/routines') || [];
        }
    },

    // Get routines by type (main or sub)
    getRoutinesByType: async (type) => {
        try {
            const routines = await apiRequest(`/routines?type=${type}`);
            return routines || [];
        } catch (error) {
            console.error(`Error fetching ${type} routines:`, error);
            return [];
        }
    },

    // Create new routine (Offline-ready)
    createRoutine: async (routineData) => {
        try {
            // Optimistic update: Add to local cache immediately
            await OfflineManager.updateCacheItem('/routines', (cached) => {
                const routines = Array.isArray(cached) ? cached : [];
                return [...routines, routineData];
            });

            // Try to send to server
            const result = await apiRequest('/routines', 'POST', routineData);
            return { success: true, data: result };
        } catch (error) {
            console.error('Error creating routine:', error);
            // Request is already queued by apiRequest/offlineManager
            return { success: true, offline: true, message: 'Saved locally' };
        }
    },

    // Update routine (Offline-ready)
    updateRoutine: async (id, routineData) => {
        try {
            // Optimistic update: Modify local cache immediately
            await OfflineManager.updateCacheItem('/routines', (cached) => {
                const routines = Array.isArray(cached) ? cached : [];
                return routines.map(r => r.id === id ? { ...r, ...routineData } : r);
            });

            // Try to send to server
            const data = await apiRequest(`/routines/${id}`, 'PUT', routineData);
            return { success: true, data };
        } catch (error) {
            console.error('Error updating routine:', error);
            // Request is already queued by apiRequest/offlineManager
            return { success: true, offline: true, message: 'Updated locally' };
        }
    },

    // Delete routine (Super Admin only)
    deleteRoutine: async (id) => {
        try {
            await apiRequest(`/routines/${id}`, 'DELETE');
            return { success: true };
        } catch (error) {
            console.error('Error deleting routine:', error);
            return { success: false, error: error.message || 'Failed to delete routine' };
        }
    }
};

export default routineService;
