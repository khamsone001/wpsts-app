import { apiRequest } from './apiHelper';
import { OfflineManager } from './offlineManager';

const routineAttendanceService = {
    getAttendanceForMonth: async (routine, year, month) => {
        const endpoint = `/attendance/${routine}/${year}/${month + 1}`;
        try {
            // 1. Check cache first for instant UI
            const cached = await OfflineManager.getCachedData(endpoint);

            // 2. Fetch from API in background
            const fetchPromise = apiRequest(endpoint).then(async (data) => {
                if (data) {
                    await OfflineManager.cacheData(endpoint, data);
                }
                return data;
            });

            return cached || await fetchPromise;
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return await OfflineManager.getCachedData(endpoint) || { adminRecords: {}, mergedRecords: {} };
        }
    },

    updateAttendance: async (attendanceData) => {
        const { routine, year, month, userId, day, status, note, adminId } = attendanceData;
        const endpoint = `/attendance/${routine}/${year}/${month}`; // Note: updateAttendance body uses 1-based month

        try {
            // Optimistic Update: Modify the cache immediately
            await OfflineManager.updateCacheItem(endpoint, (currentData) => {
                const newData = { ...currentData };

                // Ensure the structure exists
                if (!newData.adminRecords) newData.adminRecords = {};
                if (!newData.adminRecords[adminId]) newData.adminRecords[adminId] = {};
                if (!newData.adminRecords[adminId][userId]) newData.adminRecords[adminId][userId] = {};
                if (!newData.mergedRecords) newData.mergedRecords = {};
                if (!newData.mergedRecords[userId]) newData.mergedRecords[userId] = {};

                // Update the specific record
                const entry = { status, note, timestamp: new Date().toISOString(), adminId };
                newData.adminRecords[adminId][userId][day] = entry;

                // For merged, we simplify for the optimistic view (actual merge logic is on server/utils)
                newData.mergedRecords[userId][day] = entry;

                return newData;
            });

            // Send to server
            return await apiRequest('/attendance', 'POST', attendanceData);
        } catch (error) {
            console.error('Error updating attendance:', error);
            // Request is already queued by apiRequest
            return null;
        }
    },

    getAttendanceReport: async (startDate, endDate) => {
        try {
            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];
            return await apiRequest(`/attendance/report?startDate=${start}&endDate=${end}`);
        } catch (error) {
            return { users: [], report: [] };
        }
    }
};

export default routineAttendanceService;