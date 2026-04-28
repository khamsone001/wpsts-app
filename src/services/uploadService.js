import { supabase } from '../config/supabaseClient';

export const uploadImageAsync = async (uri) => {
    try {
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${Date.now()}.${fileType}`;

        // For React Native/Expo, use fetch to get blob
        const response = await fetch(uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(`images/${fileName}`, blob, {
                contentType: `image/${fileType}`,
                upsert: true,
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

        const response = await fetch(uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(`pdfs/${fileName}`, blob, {
                contentType: 'application/pdf',
                upsert: true,
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