import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './apiHelper'; // Import the helper
import { API_BASE_URL } from '../config/apiConfig';
import { uploadImageAsync } from './uploadService';

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

            // 2. Login immediately using the data from registration
            const data = registerData;

            // Store token and user data
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(data));

            // 3. If there is an image, upload it and update profile
            if (imageUri) {
                try {
                    // Upload to Cloudinary
                    const uploadResult = await uploadImageAsync(imageUri);

                    if (uploadResult && uploadResult.url) {
                        // Update User Profile with the new photoURL
                        const userId = data._id || data.id || (data.user && data.user._id);
                        const token = data.token;

                        if (!userId) {
                            console.error('Signup success but User ID is missing for image upload.');
                            return { success: true, user: { ...data, uid: data._id }, role: data.role };
                        }

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
                }
            }

            return { success: true, user: { ...data, uid: data._id }, role: data.role };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    }
};
