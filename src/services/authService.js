import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './apiHelper'; // Import the helper
import { API_BASE_URL } from '../config/apiConfig';

// The API_URL is now managed by apiHelper.js
export const AuthService = {
    login: async (identifier, password) => {
        try {
            // Use apiRequest for consistency, but handle response differently for login
            const response = await fetch(`${API_BASE_URL}/users/login`, { // Keep full fetch here for now to avoid circular dependency issues if apiHelper needs auth
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');

            // Store token and user data
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(data));

            return { success: true, user: { ...data, uid: data._id }, role: data.role };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    signup: async (email, password, userData, imageUri = null) => {
        try {
            const requestBody = {
                email,
                password,
                personalInfo: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    name: userData.name,
                    nickname: userData.nickname,
                    age: userData.age,
                    class: userData.class,
                },
                history: userData.history,
                // photoURL is not sent here initially
            };

            // 1. Register
            const registerResponse = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const registerData = await registerResponse.json();
            if (!registerResponse.ok) throw new Error(registerData.message || 'Signup failed');

            // 2. Login immediately to get token
            const loginResult = await AuthService.login(email, password);
            if (!loginResult.success) {
                throw new Error('Signup successful, but auto-login failed: ' + loginResult.error);
            }

            // 3. If there is an image, upload it and update profile
            if (imageUri && loginResult.success) {
                try {
                    // Import dynamically to avoid circular dependency issues if any
                    const { uploadImageAsync } = require('./uploadService');

                    // Upload to Cloudinary
                    const uploadResult = await uploadImageAsync(imageUri);

                    if (uploadResult && uploadResult.url) {
                        // Update User Profile with the new photoURL
                        const userId = loginResult.user._id;
                        const token = loginResult.user.token; // Or get from AsyncStorage

                        const updateResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ photoURL: uploadResult.url })
                        });

                        if (updateResponse.ok) {
                            const updatedUser = await updateResponse.json();

                            // Update local storage with new user data (including photo)
                            const currentUserData = await AsyncStorage.getItem('userData');
                            if (currentUserData) {
                                const parsedData = JSON.parse(currentUserData);
                                const newData = { ...parsedData, ...updatedUser };
                                await AsyncStorage.setItem('userData', JSON.stringify(newData));

                                // Return updated user in the success response
                                return { success: true, user: { ...newData, uid: newData._id }, role: newData.role };
                            }
                        }
                    }
                } catch (uploadError) {
                    console.error('Auto-upload profile picture failed:', uploadError);
                    // We don't fail the whole signup process just because image upload failed
                    // But we could return a warning if needed. For now, just return success.
                }
            }

            return loginResult;

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    }
};
