import { apiRequest } from './apiHelper';

export const UserService = {
    createUserProfile: async (userData) => {
        try {
            const data = await apiRequest('/users', 'POST', userData);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    getUserProfile: async (id) => {
        try {
            if (!id) {
                console.warn("getUserProfile called with no ID.");
                return null;
            }
            const user = await apiRequest(`/users/${id}`);
            return { ...user, uid: user._id };
        } catch (error) {
            if (error.message.includes('Not authorized')) {
                // Handle token issues, maybe force logout
            }
            throw error;
        }
    },

    getAllUsers: async () => {
        try {
            const users = await apiRequest('/users');
            // Sort users by workAge in descending order on the client-side as a fallback
            users.sort((a, b) => (b.history?.workAge || 0) - (a.history?.workAge || 0));
            return users.map(user => ({
                ...user,
                uid: user._id
            }));
        } catch (error) {
            return [];
        }
    },

    updateUserProfile: async (id, userData) => {
        try {
            const data = await apiRequest(`/users/${id}`, 'PUT', userData);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updateUserSkill: async (id, skillLevel) => {
        try {
            const userData = { workInfo: { skillLevel: parseInt(skillLevel) } };
            return await UserService.updateUserProfile(id, userData);
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updateUserRole: async (id, role) => {
        try {
            const userData = { role };
            return await UserService.updateUserProfile(id, userData);
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    deleteUser: async (id) => {
        try {
            await apiRequest(`/users/${id}`, 'DELETE');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    approveUser: async (id) => {
        try {
            await apiRequest(`/users/${id}/approve`, 'PUT');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    setUserPassword: async (id, password) => {
        try {
            await apiRequest(`/users/${id}/set-password`, 'PUT', { password });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        try {
            await apiRequest('/users/change-password', 'PUT', { currentPassword, newPassword });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
};
