import { supabase } from '../config/supabaseClient';

export const WorkService = {
    createWork: async (workData) => {
        try {
            const { data, error } = await supabase
                .from('works')
                .insert([workData])
                .select();
            
            if (error) throw error;
            return { success: true, id: data[0].id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    getAllWorks: async () => {
        try {
            const { data, error } = await supabase
                .from('works')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching works:', error);
            return [];
        }
    },
    getWorkById: async (id) => {
        try {
            const { data, error } = await supabase
                .from('works')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching work by id:', error);
            return null;
        }
    },
    updateWork: async (id, workData) => {
        try {
            const { error } = await supabase
                .from('works')
                .update(workData)
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    updateWorkStatus: async (id, status) => {
        try {
            return await WorkService.updateWork(id, { status });
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    deleteWork: async (id) => {
        try {
            const { error } = await supabase
                .from('works')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

