import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './apiHelper'; // Import the helper
import { getActiveServer } from '../config/apiConfig';

// The API_BASE_URL is now managed by apiHelper.js
export const uploadImageAsync = async (uri) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
        throw new Error('No user token found. Please log in.');
    }
    const API_URL = await getActiveServer();
    const apiUrl = `${API_URL}/upload`;

    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append('image', {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
    });

    const options = {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        },
    };

    const response = await fetch(apiUrl, options);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data; // This should be { url: '...' }
};

export const uploadPdfAsync = async (uri, name) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
        throw new Error('No user token found. Please log in.');
    }
    const API_URL = await getActiveServer();
    const apiUrl = `${API_URL}/upload/pdf`;

    const formData = new FormData();
    formData.append('pdf', {
        uri,
        name,
        type: 'application/pdf',
    });

    const options = {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        },
    };

    const response = await fetch(apiUrl, options);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'PDF Upload failed');
    return data; // This should be { url: '...', original_filename: '...' }
};