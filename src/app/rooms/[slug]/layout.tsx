import { notFound } from 'next/navigation';
import Link from 'next/link';
import RoomPhotoFooter from '@/components/RoomPhotoFooter';

export const runtime = 'edge';

interface RoomPhoto {
    id: number;
    url: string;
}

interface RoomPhotoItem {
    caption: string;
    room_photo: RoomPhoto;
}

interface Room {
    id: number;
    acf: {
        room_no: string;
        room_by: string;
        photo_by: string;
        room_photos: RoomPhotoItem[];
    };
}

async function getRoomByRoomNo(roomNo: string): Promise<Room | null> {
    const timestamp = Date.now();
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&per_page=100&_=${timestamp}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: {
                tags: ['rooms'],
                revalidate: 0
            }
        });

        if (!res.ok) return null;

        const data: Room[] = await res.json();
        return Array.isArray(data) ? data.find(room => room.acf.room_no === roomNo) || null : null;
    } catch (error) {
        console.error('Error fetching room by room_no in layout:', error);
        return null;
    }
}

export default async function RoomLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const room = await getRoomByRoomNo(decodeURIComponent(slug));

    if (!room) {
        notFound();
    }

    return (
        <div className="room-photo-page">
            {/* <div className="room-photo-page__header">
                <Link href="/rooms" className="back-link">BACK TO LIST</Link>
            </div> */}

            {children}

            <RoomPhotoFooter
                roomNo={room.acf.room_no}
                photoBy={room.acf.photo_by}
                roomBy={room.acf.room_by}
                totalPhotos={room.acf.room_photos?.length || 0}
            />
        </div>
    );
}
