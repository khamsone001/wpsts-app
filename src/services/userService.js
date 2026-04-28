import { supabase } from '../config/supabaseClient';

export const UserService = {
    createUserProfile: async (userData) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert([userData])
                .select()
                .single();
            
            if (error) throw error;
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
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return { ...data, uid: data.id };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    getAllUsers: async () => {
        try {
            const { data: users, error } = await supabase
                .from('profiles')
                .select('*');
            
            if (error) throw error;

            // Custom sort: Class 'M' first, then by workAge descending within each class.
            users.sort((a, b) => {
                if (a.class !== b.class) {
                    return a.class === 'M' ? -1 : 1;
                }
                return (b.history?.workAge || 0) - (a.history?.workAge || 0);
            });

            return users.map(user => ({
                ...user,
                uid: user.id
            }));
        } catch (error) {
            console.error('Error fetching all users:', error);
            return [];
        }
    },

    updateUserProfile: async (id, userData) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(userData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updateUserSkill: async (id, skillLevel) => {
        try {
            const userData = { skill_level: parseInt(skillLevel) };
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
            // Note: In Supabase, deleting from profiles won't delete from auth.users unless set up with triggers.
            // But we usually delete from profiles first.
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    approveUser: async (id) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ approved: true })
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    setUserPassword: async (id, password) => {
        // This requires admin privileges or using Supabase edge functions
        // For client-side, we can't easily set other users' passwords.
        return { success: false, error: 'Not implemented for direct client-side migration' };
    },

    changePassword: async (currentPassword, newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
};

