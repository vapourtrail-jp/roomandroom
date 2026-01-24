import { redirect } from 'next/navigation';

export async function generateStaticParams() {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?per_page=100`, {
            cache: 'force-cache'
        });
        if (!res.ok) return [];
        const rooms = await res.json() as any[];
        return rooms.map(room => ({ slug: room.acf.room_no }));
    } catch (error) {
        return [];
    }
}

export default async function RoomPageRedirect({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    redirect(`/rooms/${slug}/01`);
}
