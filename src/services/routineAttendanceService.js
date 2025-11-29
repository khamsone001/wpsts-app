import { apiRequest } from './apiHelper';

const routineAttendanceService = {
    getAttendanceForMonth: async (routine, year, month) => {
        try {
            return await apiRequest(`/attendance/${routine}/${year}/${month + 1}`);
        } catch (error) {
            return { adminRecords: {}, mergedRecords: {} };
        }
    },
    updateAttendance: async (attendanceData) => {
        try {
            return await apiRequest('/attendance', 'POST', attendanceData);
        } catch (error) {
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