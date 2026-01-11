import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/apiConfig';

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
    // DIAGNOSTIC LOG: Check what URL is actually being used
    console.log(`[API Debug] Requesting: ${API_BASE_URL}${endpoint}`);

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

    // Retry configuration
    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        // Add timeout for Render Free Tier (may take 60s to wake up)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

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
        } catch (error) {
            clearTimeout(timeoutId);
            attempts++;

            const isNetworkError = error.message.includes('Network request failed') || error.name === 'AbortError';

            // Only retry if it's a network/timeout error and we have retries left
            if (isNetworkError && attempts < MAX_RETRIES) {
                console.log(`Attempt ${attempts} failed. Retrying in ${attempts * 2}s...`);
                // Wait before retrying (exponential backoff: 2s, 4s...)
                await new Promise(resolve => setTimeout(resolve, attempts * 2000));
                continue;
            }

            // If it's the last attempt or not a retryable error, throw it
            if (attempts === MAX_RETRIES) {
                console.error(`API Error on ${method} ${endpoint} after ${MAX_RETRIES} attempts:`, error);
            } else {
                console.error(`API Error on ${method} ${endpoint}:`, error);
            }

            throw error;
        }
    }
};