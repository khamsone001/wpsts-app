import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Convert base64 string to Uint8Array using pure JS (no atob)
function base64ToBytes(base64) {
    const OUTPUT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let input = base64.replace(/^data:[^;]+;base64,/, '');
    
    const result = [];
    let value = 0;
    let bits = 0;
    
    for (let i = 0; i < input.length; i++) {
        if (input[i] === '=') break;
        const idx = OUTPUT.indexOf(input[i]);
        if (idx === -1) continue;
        
        value = (value << 6) | idx;
        bits += 6;
        
        if (bits >= 8) {
            bits -= 8;
            result.push((value >> bits) & 0xFF);
        }
    }
    
    return new Uint8Array(result);
}

export const uploadImageAsync = async (uri) => {
    try {
        let fileExt = uri.split('.').pop().toLowerCase();
        
        if (uri.startsWith('data:')) {
            fileExt = 'jpg';
        }
        
        const fileName = `images/${Date.now()}.${fileExt}`;

        // Read file as base64 using expo-file-system
        const base64String = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to bytes
        const bytes = base64ToBytes(base64String);

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

        const base64String = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const bytes = base64ToBytes(base64String);

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