
import { notFound, redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function RoomPageRedirect({ params }: PageProps) {
    const { slug } = await params;
    if (!slug) notFound();
    // 最初の写真へリダイレクト
    redirect(`/rooms/${slug}/01`);
}
