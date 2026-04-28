import { supabase } from '../config/supabaseClient';

const documentService = {
    createDocument: async (documentData) => {
        try {
            const { data, error } = await supabase
                .from('documents')
                .insert([documentData])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, document: { ...data, id: data.id } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    getAllDocuments: async () => {
        try {
            const { data: documents, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            const formattedDocs = documents.map(doc => ({ ...doc, id: doc.id }));
            return { success: true, documents: formattedDocs };
        } catch (error) {
            return { success: false, error: error.message, documents: [] };
        }
    },
    updateDocument: async (id, documentData) => {
        try {
            const { error } = await supabase
                .from('documents')
                .update(documentData)
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    deleteDocument: async (id) => {
        try {
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
};

export default documentService;