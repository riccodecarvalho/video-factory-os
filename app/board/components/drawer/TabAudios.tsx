'use client';

import { useState, useEffect } from 'react';
import { getJobArtifacts } from '../../actions';

interface TabAudiosProps {
    jobId: string;
}

interface AudioArtifact {
    id: string;
    filename: string;
    path: string;
    metadata?: string;
}

export function TabAudios({ jobId }: TabAudiosProps) {
    const [audios, setAudios] = useState<AudioArtifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState<string | null>(null);

    useEffect(() => {
        async function loadAudios() {
            try {
                const artifacts = await getJobArtifacts(jobId, 'audio');
                setAudios(artifacts as AudioArtifact[]);
            } catch (err) {
                console.error('Error loading audios:', err);
            } finally {
                setLoading(false);
            }
        }

        loadAudios();
    }, [jobId]);

    const togglePlay = (audioId: string) => {
        setPlayingId(playingId === audioId ? null : audioId);
        // Actual audio playback would be implemented here
    };

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    if (audios.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="text-2xl mb-2">🎙️</div>
                <p className="text-muted-foreground text-sm">
                    Áudios serão gerados após a narração (TTS)
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-2">
            {audios.map((audio) => {
                const isPlaying = playingId === audio.id;
                let duration = '--:--';

                if (audio.metadata) {
                    try {
                        const meta = JSON.parse(audio.metadata);
                        if (meta.duration) {
                            const mins = Math.floor(meta.duration / 60);
                            const secs = Math.floor(meta.duration % 60);
                            duration = `${mins}:${secs.toString().padStart(2, '0')}`;
                        }
                    } catch {
                        // Ignore parse errors
                    }
                }

                return (
                    <div
                        key={audio.id}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg"
                    >
                        <button
                            onClick={() => togglePlay(audio.id)}
                            className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isPlaying
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                                }
              `}
                        >
                            {isPlaying ? '⏸' : '▶'}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                                {audio.filename}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {duration}
                            </div>
                        </div>

                        <button className="text-muted-foreground hover:text-foreground">
                            ⬇
                        </button>
                    </div>
                );
            })}

            {/* Combined audio */}
            <div className="pt-4 border-t border-border">
                <button className="w-full py-2 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20">
                    ⬇ Download Áudio Combinado
                </button>
            </div>
        </div>
    );
}
