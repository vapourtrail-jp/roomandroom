import { notFound, redirect } from 'next/navigation';

export const runtime = 'edge';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function RoomPageRedirect({ params }: PageProps) {
    const { slug } = await params;
    if (!slug) notFound();
    redirect(`/rooms/${slug}/01`);
}
