import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple base64 decoder
function decodeBase64(base64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let data = base64.replace(/^data:[^;]+;base64,/, '');
    
    const result = [];
    let value = 0;
    let bits = 0;
    
    for (let i = 0; i < data.length; i++) {
        if (data[i] === '=') break;
        const idx = chars.indexOf(data[i]);
        if (idx < 0) continue;
        
        value = (value << 6) | idx;
        bits += 6;
        
        if (bits >= 8) {
            bits -= 8;
            result.push((value >> bits) & 255);
        }
    }
    
    return new Uint8Array(result);
}

export const uploadImageAsync = async (uri) => {
    try {
        let fileExt = 'jpg';
        
        // Try to determine file type
        if (!uri.startsWith('data:') && !uri.startsWith('file://')) {
            fileExt = uri.split('.').pop().toLowerCase() || 'jpg';
        }
        
        const fileName = `images/${Date.now()}.${fileExt}`;

        // Try File System read with explicit encoding
        let bytes;
        
        try {
            // Simple approach - read as string (should return base64 for images)
            const readUri = uri.startsWith('file://') ? uri : `file://${uri}`;
            const base64 = await FileSystem.readAsStringAsync(readUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            bytes = decodeBase64(base64);
        } catch (e) {
            // Try without options
            const content = await FileSystem.readAsStringAsync(uri);
            bytes = new TextEncoder().encode(content);
        }

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(fileName, bytes, {
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

        const content = await FileSystem.readAsStringAsync(uri);
        const bytes = new TextEncoder().encode(content);

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(fileName, bytes, {
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