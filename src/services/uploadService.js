import { supabase } from '../config/supabaseClient';
import * as FileSystem from 'expo-file-system';

const decodeBase64ToUint8Array = (base64) => {
    const base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
    
    const output = [];
    let buffer = 0;
    let bits = 0;
    
    for (let i = 0; i < cleanBase64.length; i++) {
        const char = cleanBase64[i];
        if (char === '=') break;
        
        const index = base64Characters.indexOf(char);
        if (index === -1) continue;
        
        buffer = (buffer << 6) | index;
        bits += 6;
        
        if (bits >= 8) {
            bits -= 8;
            output.push((buffer >> bits) & 0xFF);
        }
    }
    
    return new Uint8Array(output);
};

export const uploadImageAsync = async (uri) => {
    try {
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${Date.now()}.${fileType}`;

        const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const bytes = decodeBase64ToUint8Array(base64Data);

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(`images/${fileName}`, bytes, {
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

        const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const bytes = decodeBase64ToUint8Array(base64Data);

        const { data, error } = await supabase.storage
            .from('wpsts-uploads')
            .upload(`pdfs/${fileName}`, bytes, {
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