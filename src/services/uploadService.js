import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use a simpler filename approach
export const uploadImageAsync = async (uri) => {
    try {
        // Get file extension from URI
        const uriParts = uri.split('.');
        let fileExt = uriParts[uriParts.length - 1];
        
        // Handle data URI case
        if (uri.startsWith('data:')) {
            fileExt = 'jpg'; // Default to jpg for base64 data URIs
        }
        
        const fileName = `images/${Date.now()}.${fileExt}`;

        // Read as binary
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(fileName, uint8Array, {
                contentType: blob.type || `image/${fileExt}`,
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
        const blob = await response.blob();
        
        const arrayBuffer = await blob.arrayBuffer();
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