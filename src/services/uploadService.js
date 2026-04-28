import { supabase } from '../config/supabaseClient';

export const uploadImageAsync = async (uri) => {
    try {
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${Date.now()}.${fileType}`;

        const response = await fetch(uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(`images/${fileName}`, blob, {
                contentType: `image/${fileType}`,
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(`images/${fileName}`);

        return { url: publicUrlData.publicUrl };
    } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
    }
};

export const uploadPdfAsync = async (uri, name) => {
    try {
        const fileName = `${Date.now()}_${name}`;

        const response = await fetch(uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(`pdfs/${fileName}`, blob, {
                contentType: 'application/pdf',
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(`pdfs/${fileName}`);

        return { url: publicUrlData.publicUrl, original_filename: name };
    } catch (error) {
        console.error('PDF upload failed:', error);
        throw error;
    }
};