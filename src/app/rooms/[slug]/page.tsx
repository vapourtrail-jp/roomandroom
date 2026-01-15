import { notFound, redirect } from 'next/navigation';

export const runtime = 'edge';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function RoomPageRedirect({ params }: PageProps) {
    const { slug } = await params;
    // 常に最初の写真 (01) へリダイレクトする
    redirect(`/rooms/${slug}/01`);
}
