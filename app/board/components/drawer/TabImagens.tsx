'use client';

import { useState, useEffect } from 'react';
import { getJobArtifacts } from '../../actions';

interface TabImagensProps {
    jobId: string;
    isEditable: boolean;
}

interface ImageArtifact {
    id: string;
    filename: string;
    path: string;
    metadata?: string;
}

export function TabImagens({ jobId, isEditable }: TabImagensProps) {
    const [images, setImages] = useState<ImageArtifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        async function loadImages() {
            try {
                const artifacts = await getJobArtifacts(jobId, 'image');
                setImages(artifacts as ImageArtifact[]);
            } catch (err) {
                console.error('Error loading images:', err);
            } finally {
                setLoading(false);
            }
        }

        loadImages();
    }, [jobId]);

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="text-2xl mb-2">🖼️</div>
                <p className="text-muted-foreground text-sm mb-4">
                    Nenhuma imagem gerada ainda
                </p>
                {isEditable && (
                    <button className="text-sm text-primary hover:underline">
                        + Upload de imagens
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                    <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.path)}
                        className="aspect-video bg-muted rounded overflow-hidden hover:ring-2 ring-primary transition-all"
                    >
                        <img
                            src={img.path}
                            alt={img.filename}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.png';
                            }}
                        />
                    </button>
                ))}
            </div>

            {/* Actions */}
            {isEditable && (
                <div className="mt-4 flex gap-2">
                    <button className="flex-1 py-2 text-sm border border-border rounded hover:bg-muted">
                        + Upload
                    </button>
                    <button className="flex-1 py-2 text-sm border border-border rounded hover:bg-muted">
                        🎲 Gerar com IA
                    </button>
                </div>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="max-w-[90%] max-h-[90%] object-contain"
                    />
                    <button
                        className="absolute top-4 right-4 text-white text-2xl"
                        onClick={() => setSelectedImage(null)}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
