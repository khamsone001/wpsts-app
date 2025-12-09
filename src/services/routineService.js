import { apiRequest } from './apiHelper';

const routineService = {
    // Get all routines
    getAllRoutines: async () => {
        try {
            const routines = await apiRequest('/routines');
            return routines || [];
        } catch (error) {
            console.error('Error fetching routines:', error);
            return [];
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

    // Create new routine (Super Admin only)
    createRoutine: async (routineData) => {
        try {
            const data = await apiRequest('/routines', 'POST', routineData);
            return { success: true, data };
        } catch (error) {
            console.error('Error creating routine:', error);
            return { success: false, error: error.message || 'Failed to create routine' };
        }
    },

    // Update routine (Super Admin only)
    updateRoutine: async (id, routineData) => {
        try {
            const data = await apiRequest(`/routines/${id}`, 'PUT', routineData);
            return { success: true, data };
        } catch (error) {
            console.error('Error updating routine:', error);
            return { success: false, error: error.message || 'Failed to update routine' };
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
