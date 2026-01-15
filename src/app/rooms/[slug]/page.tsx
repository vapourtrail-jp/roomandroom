import { notFound } from 'next/navigation';
import RoomGallery from '@/components/RoomGallery';

export const runtime = 'edge';

interface RoomPhoto {
    id: number;
    title: string;
    url: string;
    width: number;
    height: number;
    alt: string;
}

interface RoomPhotoItem {
    caption: string;
    room_photo: RoomPhoto;
}

interface Room {
    id: number;
    slug: string;
    title: {
        rendered: string;
    };
    acf: {
        room_no: string;
        room_by: string;
        photo_by: string;
        room_desc: string;
        sns_instagram: string;
        sns_x: string;
        photo_count: string;
        room_thumbnail: RoomPhoto;
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
        console.error('Error fetching room by room_no:', error);
        return null;
    }
}

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function RoomDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const room = await getRoomByRoomNo(decodeURIComponent(slug));

    if (!room) {
        notFound();
    }

    return (
        <div className="room-detail-container">
            <h1 className="title">{room.acf.room_no || room.title.rendered}</h1>

            <div className="room-detail__content">
                {room.acf.room_desc && (
                    <div className="room-detail__description">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{room.acf.room_desc}</p>
                    </div>
                )}

                <div className="room-detail__meta">
                    {room.acf.photo_by && <p>photo by: {room.acf.photo_by}</p>}
                    {room.acf.room_by && <p>room by: {room.acf.room_by}</p>}
                </div>

                <div className="room-detail__gallery">
                    <RoomGallery
                        photos={room.acf.room_photos}
                        roomName={room.acf.room_no || room.title.rendered}
                    />
                </div>
            </div>
        </div>
    );
}
