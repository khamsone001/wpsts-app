import { supabase } from '../config/supabaseClient';
import { OfflineManager } from './offlineManager';

const routineAttendanceService = {
    getAttendanceForMonth: async (routine, year, month) => {
        const endpoint = `/attendance/${routine}/${year}/${month + 1}`;
        try {
            // 1. Check cache first
            const cached = await OfflineManager.getCachedData(endpoint);

            // 2. Fetch from Supabase
            // Note: This logic assumes an 'attendance_monthly' table that stores the aggregated view.
            // If you prefer individual records, this logic will need to change.
            const fetchPromise = supabase
                .from('attendance_monthly')
                .select('data')
                .eq('routine', routine)
                .eq('year', year)
                .eq('month', month + 1)
                .single()
                .then(async ({ data, error }) => {
                    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'
                    const result = data?.data || { adminRecords: {}, mergedRecords: {} };
                    await OfflineManager.cacheData(endpoint, result);
                    return result;
                });

            return cached || await fetchPromise;
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return await OfflineManager.getCachedData(endpoint) || { adminRecords: {}, mergedRecords: {} };
        }
    },

    updateAttendance: async (attendanceData) => {
        const { routine, year, month, userId, day, status, note, adminId } = attendanceData;
        const endpoint = `/attendance/${routine}/${year}/${month}`;

        try {
            // Optimistic Update
            await OfflineManager.updateCacheItem(endpoint, (currentData) => {
                const newData = { ...currentData };
                if (!newData.adminRecords) newData.adminRecords = {};
                if (!newData.adminRecords[adminId]) newData.adminRecords[adminId] = {};
                if (!newData.adminRecords[adminId][userId]) newData.adminRecords[adminId][userId] = {};
                if (!newData.mergedRecords) newData.mergedRecords = {};
                if (!newData.mergedRecords[userId]) newData.mergedRecords[userId] = {};

                const entry = { status, note, timestamp: new Date().toISOString(), adminId };
                newData.adminRecords[adminId][userId][day] = entry;
                newData.mergedRecords[userId][day] = entry;
                return newData;
            });

            // In Supabase, we can use an 'attendance_logs' table for raw records
            const { error } = await supabase
                .from('attendance_logs')
                .insert([{
                    routine,
                    year,
                    month,
                    user_id: userId,
                    day,
                    status,
                    note,
                    admin_id: adminId,
                    created_at: new Date().toISOString()
                }]);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating attendance:', error);
            return null;
        }
    },

    getAttendanceReport: async (startDate, endDate) => {
        try {
            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('attendance_logs')
                .select('*')
                .gte('created_at', start)
                .lte('created_at', end);
            
            if (error) throw error;
            // Note: Report formatting might be needed here to match original API response
            return { users: [], report: data };
        } catch (error) {
            return { users: [], report: [] };
        }
    }
};

export default routineAttendanceService;