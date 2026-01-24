import { redirect } from 'next/navigation';

export async function generateStaticParams() {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&per_page=100`, {
            cache: 'force-cache'
        });
        if (!res.ok) return [];
        const rooms = await res.json() as any[];
        const tags = new Set<string>();
        rooms.forEach((room: any) => {
            (room.acf.room_photos || []).forEach((photo: any) => {
                const tagString = photo.tags || '';
                const tagsArray = tagString.split(/[,\s]+/).map((t: string) => t.trim()).filter((t: string) => t !== '');
                tagsArray.forEach((tagName: string) => tags.add(tagName));
            });
        });
        return Array.from(tags).map(tag => ({ tag: encodeURIComponent(tag) }));
    } catch (error) {
        return [];
    }
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    redirect(`/tags/${tag}/01`);
}
