import { createClient } from '@supabase/supabase-js';
import { File, Paths, FileSystem } from 'expo-file-system';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base64 decoder
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
        if (!uri.startsWith('data:') && !uri.startsWith('file://')) {
            fileExt = uri.split('.').pop().toLowerCase() || 'jpg';
        }
        
        const fileName = `images/${Date.now()}.${fileExt}`;

        let bytes;
        
        // Use new File API
        const tempFile = new File(Paths.cache, `upload_${Date.now()}.${fileExt}`);
        
        // Copy the image to temp location
        await FileSystem.copyAsync({
            from: uri,
            to: tempFile.uri
        });
        
        // Read as base64
        const base64Data = await tempFile.base64();
        bytes = decodeBase64(base64Data);

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

        const tempFile = new File(Paths.cache, `upload_${Date.now()}.pdf`);
        await FileSystem.copyAsync({ from: uri, to: tempFile.uri });
        
        const base64Data = await tempFile.base64();
        const bytes = decodeBase64(base64Data);

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