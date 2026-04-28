import { supabase } from '../config/supabaseClient';

export const uploadImageAsync = async (uri) => {
    try {
        const fileExt = uri.split('.').pop().toLowerCase();
        const fileName = `images/${Date.now()}.${fileExt}`;

        // Upload via Supabase REST API directly
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

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

        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

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