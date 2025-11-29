import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/apiConfig';

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        // Add timeout for Render Free Tier (may take 30-60s to wake up)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...config,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An API error occurred');
            }

            return data;
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('Request timeout - Server may be waking up. Please try again.');
            }
            throw fetchError;
        }
    } catch (error) {
        console.error(`API Error on ${method} ${endpoint}:`, error);
        throw error;
    }
};