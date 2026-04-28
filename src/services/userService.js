import { supabase } from '../config/supabaseClient';
import { normalizeUserData } from '../utils/userNormalizer';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wpsts-backend.onrender.com/api';

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

    getUserProfile: async (id, fresh = false) => {
        try {
            if (!id) {
                console.warn("getUserProfile called with no ID.");
                return null;
            }
            
            // Always get fresh data by doing a fresh query
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            // Normalize the data for frontend
            const normalized = normalizeUserData(data);
            return { ...normalized, uid: data.id };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },
        }
    },
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
                return (b.work_age || 0) - (a.work_age || 0);
            });

            return users.map(user => ({
                ...normalizeUserData(user),
                uid: user.id
            }));
        } catch (error) {
            console.error('Error fetching all users:', error);
            return [];
        }
    },

    updateUserProfile: async (id, userData) => {
        // Flatten nested data if needed (convert personalInfo.class -> class, etc.)
        let flatData = { ...userData };
        
        if (userData.personalInfo) {
            flatData.class = userData.personalInfo.class;
            flatData.first_name = userData.personalInfo.firstName;
            flatData.last_name = userData.personalInfo.lastName;
            flatData.nickname = userData.personalInfo.nickname;
            flatData.age = userData.personalInfo.age;
            flatData.address_house = userData.personalInfo.currentAddress?.house;
            flatData.address_city = userData.personalInfo.currentAddress?.city;
            flatData.address_district = userData.personalInfo.currentAddress?.district;
            delete flatData.personalInfo;
        }
        
        if (userData.history) {
            flatData.work_age = userData.history.workAge;
            flatData.birth_date = userData.history.birthDate;
            flatData.birth_place_house = userData.history.placeOfBirth?.house;
            flatData.birth_place_city = userData.history.placeOfBirth?.city;
            flatData.birth_place_district = userData.history.placeOfBirth?.district;
            flatData.race = userData.history.race;
            flatData.nationality = userData.history.nationality;
            flatData.tribe = userData.history.tribe;
            flatData.education = userData.history.education;
            delete flatData.history;
        }
        
        if (userData.photoURL) {
            flatData.photo_url = userData.photoURL;
            delete flatData.photoURL;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(flatData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data: data?.[0] };
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

    setUserPassword: async (id, newPassword) => {
        // Call backend API to set password
        try {
            const token = await supabase.auth.getSession();
            const response = await fetch(`${API_URL}/users/${id}/set-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.data.session?.access_token}`
                },
                body: JSON.stringify({ password: newPassword })
            });
            
            if (!response.ok) throw new Error('Failed to set password');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    deleteUser: async (id) => {
        try {
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

