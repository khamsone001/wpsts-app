import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Decode base64 to Uint8Array manually
function decodeBase64(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export const uploadImageAsync = async (uri) => {
    try {
        let fileExt = uri.split('.').pop().toLowerCase();
        
        if (uri.startsWith('data:')) {
            fileExt = 'jpg';
        }
        
        const fileName = `images/${Date.now()}.${fileExt}`;

        // Read as base64 string
        const base64String = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Decode base64 to bytes
        const uint8Array = decodeBase64(base64String);

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(fileName, uint8Array, {
                contentType: `image/${fileExt}`,
                upsert: true,
            });

        if (error) {
            console.log('Upload error:', error.message);
            return { url: null, error: error.message };
        }

        const { data: publicUrlData } = supabase.storage
            .from('wpsts-uploads')
            .getPublicUrl(fileName);

        return { url: publicUrlData.publicUrl };
    } catch (error) {
        console.error('Image upload failed:', error);
        return { url: null, error: error.message };
    }
};

export const uploadPdfAsync = async (uri, name) => {
    try {
        const fileName = `pdfs/${Date.now()}_${name}`;

        const base64String = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const uint8Array = decodeBase64(base64String);

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(fileName, uint8Array, {
                contentType: 'application/pdf',
                upsert: true,
            });

        if (error) {
            console.log('Upload error:', error.message);
            return { url: null, error: error.message };
        }

        const { data: publicUrlData } = supabase.storage
            .from('wpsts-uploads')
            .getPublicUrl(fileName);

        return { url: publicUrlData.publicUrl, original_filename: name };
    } catch (error) {
        console.error('PDF upload failed:', error);
        return { url: null, error: error.message };
    }
};