import { createClient } from "@/lib/supabase/client";

/**
 * Uploads a file to Supabase Storage
 * @param file The file object to upload
 * @param bucket The storage bucket name (default: 'images')
 * @param folder The folder path within the bucket (e.g. 'products', 'categories')
 * @returns The public URL of the uploaded file
 */
export const uploadImage = async (
    file: File,
    folder: string = 'uploads',
    bucket: string = 'images'
) => {
    const supabase = createClient();

    // Sanitize file name and create unique path
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Upload
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return publicUrl;
};
