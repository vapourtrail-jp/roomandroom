import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default async function RoomPageRedirect({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    redirect(`/rooms/${slug}/01`);
}
