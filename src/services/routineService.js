import { supabase } from '../config/supabaseClient';
import { OfflineManager } from './offlineManager';

const routineService = {
    // Get all routines (Offline-first / SWR Pattern)
    getAllRoutines: async () => {
        try {
            // 1. Try to get from cache first for instant UI
            const cached = await OfflineManager.getCachedData('/routines');

            // 2. Fetch from Supabase in background
            const fetchPromise = supabase
                .from('routines')
                .select('*')
                .order('created_at', { ascending: false })
                .then(async ({ data, error }) => {
                    if (error) throw error;
                    if (data && Array.isArray(data)) {
                        await OfflineManager.cacheData('/routines', data);
                    }
                    return data;
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
            const { data, error } = await supabase
                .from('routines')
                .select('*')
                .eq('type', type);
            
            if (error) throw error;
            return data || [];
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

            // Try to send to Supabase
            const { data, error } = await supabase
                .from('routines')
                .insert([routineData])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating routine:', error);
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

            // Try to send to Supabase
            const { data, error } = await supabase
                .from('routines')
                .update(routineData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating routine:', error);
            return { success: true, offline: true, message: 'Updated locally' };
        }
    },

    // Delete routine (Super Admin only)
    deleteRoutine: async (id) => {
        try {
            const { error } = await supabase
                .from('routines')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting routine:', error);
            return { success: false, error: error.message || 'Failed to delete routine' };
        }
    }
};

export default routineService;

