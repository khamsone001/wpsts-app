import { apiRequest } from './apiHelper';

const documentService = {
    createDocument: async (documentData) => {
        try {
            const data = await apiRequest('/documents', 'POST', documentData);
            return { success: true, document: { ...data, id: data._id } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    getAllDocuments: async () => {
        try {
            const documents = await apiRequest('/documents');
            const formattedDocs = documents.map(doc => ({ ...doc, id: doc._id }));
            return { success: true, documents: formattedDocs };
        } catch (error) {
            return { success: false, error: error.message, documents: [] };
        }
    },
    updateDocument: async (id, documentData) => {
        try {
            await apiRequest(`/documents/${id}`, 'PUT', documentData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    deleteDocument: async (id) => {
        try {
            await apiRequest(`/documents/${id}`, 'DELETE');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
};

export default documentService;