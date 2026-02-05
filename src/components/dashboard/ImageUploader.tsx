"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { uploadImage } from '@/lib/storage';
import Image from 'next/image';

interface ImageUploaderProps {
    value: string | null;
    onChange: (url: string | null) => void;
    disabled?: boolean;
    bucket?: string;
    folder?: string;
    label?: string;
}

export function ImageUploader({
    value,
    onChange,
    disabled = false,
    bucket = 'images',
    folder = 'uploads',
    label = "Imagen del producto"
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("La imagen es demasiado grande (máx 5MB)");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const url = await uploadImage(file, folder, bucket);
            onChange(url);
        } catch (err: any) {
            console.error(err);
            setError("Error al subir imagen. Inténtalo de nuevo.");
        } finally {
            setUploading(false);
        }
    }, [bucket, folder, onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': []
        },
        maxFiles: 1,
        disabled: disabled || uploading
    });

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
                    relative group cursor-pointer
                    border-2 border-dashed rounded-xl
                    transition-all duration-200 ease-in-out
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                    ${value ? 'border-solid border-slate-200 p-0 overflow-hidden bg-slate-100' : 'p-8 flex flex-col items-center justify-center min-h-[200px]'}
                `}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="flex flex-col items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <p className="text-sm font-medium text-slate-500">Subiendo imagen...</p>
                    </div>
                ) : value && !error ? (
                    <div className="relative w-full h-[250px] bg-slate-100">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <p className="text-white font-medium text-sm">Cambiar imagen</p>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-white transition-all z-10"
                            title="Eliminar imagen"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className={`
                            w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center
                            ${isDragActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}
                        `}>
                            <UploadCloud size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            {isDragActive ? "Suelta la imagen aquí" : label}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                            Arrastra y suelta o haz click para seleccionar (JPG, PNG, WEBP)
                        </p>
                    </div>
                )}

                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-medium text-center border border-red-100">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
