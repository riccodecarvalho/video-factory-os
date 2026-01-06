import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Board | Video Factory OS',
    description: 'Kanban board para produção de vídeos',
};

export default function BoardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
