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
                    // Ensure uid is set from _id if it's missing (critical for adminId consistency)
                    if (!userData.uid && (userData._id || userData.id)) {
                        userData.uid = userData._id || userData.id;
                    }
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
            // AuthService now handles registration, token generation, and image upload internally
            const signupResult = await AuthService.signup(email, password, userData, localImageUri);

            if (!signupResult.success) {
                throw new Error(signupResult.error || 'Signup failed');
            }

            const finalUser = signupResult.user;
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

    const signUp = async (userData) => {
        try {
            // 1. Register user
            const response = await fetch('YOUR_API_URL/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (!response.ok) throw new Error('Registration failed');

            const data = await response.json();
            console.log('Sign up response:', data);

            // 2. Auto login หลังสำเร็จ
            if (data.token || data.user) {
                await AsyncStorage.setItem('userToken', data.token || data.user.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                setUser(data.user);
                setIsLoggedIn(true);
                console.log('Auto login success');
            }

            return { success: true };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, userRole, isLoading, login, logout, signup, updateUserProfile, signUp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
