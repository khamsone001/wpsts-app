import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabaseClient';
import { uploadImageAsync } from './uploadService';

export const AuthService = {
    login: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Supabase handles session automatically, but we can store extra data if needed
            const user = data.user;
            
            // Fetch profile data
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const userData = {
                ...user,
                ...profile,
                uid: user.id,
                token: data.session.access_token
            };

            await AsyncStorage.setItem('userToken', userData.token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));

            return { success: true, user: userData, role: profile?.role };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    signup: async (email, password, userData, imageUri = null) => {
        try {
            // 1. Register with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                    }
                }
            });

            if (authError) throw authError;
            const user = authData.user;

            if (!user) throw new Error('Signup failed: No user returned');

            // 2. Create profile in 'profiles' table - match with new database schema
            const profileData = {
                id: user.id,
                email: email,
                first_name: userData.firstName,
                last_name: userData.lastName,
                name: userData.firstName + ' ' + userData.lastName,
                nickname: userData.nickname,
                age: userData.age,
                class: userData.class,
                role: 'user',
                approved: false,
                work_age: userData.history?.workAge,
                birth_date: userData.history?.birthDate,
                race: userData.history?.race,
                nationality: userData.history?.nationality,
                tribe: userData.history?.tribe,
                education: userData.history?.education,
                created_at: new Date().toISOString(),
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .insert([profileData]);

            console.log('Profile insert result:', { profileData, profileError });
            
            if (profileError) {
                throw new Error('ERR: ' + profileError.message + ' | Code: ' + profileError.code);
            }

            // 3. Handle image upload if provided
            let photoURL = null;
            if (imageUri) {
                try {
                    const uploadResult = await uploadImageAsync(imageUri);
                    if (uploadResult && uploadResult.url) {
                        photoURL = uploadResult.url;
                        await supabase
                            .from('profiles')
                            .update({ photo_url: photoURL })
                            .eq('id', user.id);
                    }
                } catch (uploadError) {
                    console.error('Profile picture upload failed:', uploadError);
                }
            }

            const finalUserData = {
                ...user,
                ...profileData,
                photo_url: photoURL,
                uid: user.id,
                token: authData.session?.access_token
            };

            // Store session data
            if (authData.session) {
                await AsyncStorage.setItem('userToken', authData.session.access_token);
                await AsyncStorage.setItem('userData', JSON.stringify(finalUserData));
            }

            return { success: true, user: finalUserData, role: 'user' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    logout: async () => {
        await supabase.auth.signOut();
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    }
};

