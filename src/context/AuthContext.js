import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { uploadImageAsync } from '../services/uploadService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Start with loading true

    useEffect(() => {
        // Check for stored user data on app startup
        const checkLoginState = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    setUser(userData);
                    setUserRole(userData.role);
                }
            } catch (e) {
                console.error("Failed to load user data from storage", e);
            } finally {
                setIsLoading(false);
            }
        };
 
        checkLoginState();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const { user: loggedInUser, role } = await AuthService.login(email, password);
            setUser(loggedInUser);
            setUserRole(role);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
        setUserRole(null);
    };

    const signup = async (email, password, userData, localImageUri) => {
        setIsLoading(true);
        try {
            // Step 1: Register user without photoURL
            const signupResult = await AuthService.signup(email, password, userData, null);
            if (!signupResult.success) {
                throw new Error(signupResult.error || 'Signup failed');
            }

            // At this point, user is created and logged in (token is stored)
            let finalUser = signupResult.user;

            // Step 2: If there's an image, upload it now that we have a token
            if (localImageUri) {
                const uploadResult = await uploadImageAsync(localImageUri);
                const newPhotoURL = uploadResult.url;

                // Step 3: Update the user profile with the new photoURL
                const updateResult = await updateUserProfile({ photoURL: newPhotoURL });
                if (updateResult.success) finalUser = updateResult.data;
            }

            setUser(finalUser);
            setUserRole(finalUser.role);
            return { success: true, user: finalUser };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserProfile = async (data) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error('No user logged in');
            const result = await UserService.updateUserProfile(user.uid, data); // API returns the updated user
            if (result.success && result.data) {
                const updatedUser = { ...result.data, uid: result.data._id };
                setUser(updatedUser); // Update state
                await AsyncStorage.setItem('userData', JSON.stringify(updatedUser)); // Update storage
                return { success: true, data: updatedUser };
            }
            return { success: false, error: result.error || 'Update failed' };
        } catch (error) {
            console.error("Error in AuthContext updateUserProfile:", error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userRole, isLoading, login, logout, signup, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
