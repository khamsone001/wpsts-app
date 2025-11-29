import { apiRequest } from './apiHelper';

export const WorkService = {
    createWork: async (workData) => {
        try {
            const data = await apiRequest('/works', 'POST', workData);
            return { success: true, id: data._id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    getAllWorks: async () => {
        try {
            const works = await apiRequest('/works');
            return works.map(work => ({ ...work, id: work._id }));
        } catch (error) {
            return [];
        }
    },
    getWorkById: async (id) => {
        try {
            const work = await apiRequest(`/works/${id}`);
            return { ...work, id: work._id };
        } catch (error) {
            return null;
        }
    },
    updateWork: async (id, workData) => {
        try {
            await apiRequest(`/works/${id}`, 'PUT', workData);
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
            await apiRequest(`/works/${id}`, 'DELETE');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};
