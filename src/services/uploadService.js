import { supabase } from '../config/supabaseClient';
import * as FileSystem from 'expo-file-system';

export const uploadImageAsync = async (uri) => {
    try {
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${Date.now()}.${fileType}`;

        // For React Native, use FileSystem to read as base64
        const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(`images/${fileName}`, bytes, {
                contentType: `image/${fileType}`,
            });

        if (error) {
            console.log('Upload error:', error.message);
            return { url: null, error: error.message };
        }

        const { data: publicUrlData } = supabase.storage
            .from('wpsts-uploads')
            .getPublicUrl(`images/${fileName}`);

        return { url: publicUrlData.publicUrl };
    } catch (error) {
        console.error('Image upload failed:', error);
        return { url: null, error: error.message };
    }
};

export const uploadPdfAsync = async (uri, name) => {
    try {
        const fileName = `${Date.now()}_${name}`;

        const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(`pdfs/${fileName}`, bytes, {
                contentType: 'application/pdf',
            });

        if (error) {
            console.log('Upload error:', error.message);
            return { url: null, error: error.message };
        }

        const { data: publicUrlData } = supabase.storage
            .from('wpsts-uploads')
            .getPublicUrl(`pdfs/${fileName}`);

        return { url: publicUrlData.publicUrl, original_filename: name };
    } catch (error) {
        console.error('PDF upload failed:', error);
        return { url: null, error: error.message };
    }
};