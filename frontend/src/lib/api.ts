import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const api = {
    submit: async (data: { url?: string; text?: string }) => {
        const response = await axios.post(`${API_BASE_URL}/submit`, data);
        return response.data;
    },
    getStatus: async (jobId: string) => {
        const response = await axios.get(`${API_BASE_URL}/status/${jobId}`);
        return response.data;
    },
    getResult: async (jobId: string) => {
        const response = await axios.get(`${API_BASE_URL}/result/${jobId}`);
        return response.data;
    },
    getHealth: async () => {
        const response = await axios.get(`${API_BASE_URL}/health`);
        return response.data;
    },
};
