export const runtime = 'edge';
import { notFound } from 'next/navigation';
import RoomPhotoFooter from '@/components/RoomPhotoFooter';
import { Suspense } from 'react';

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

async function getAllRooms(): Promise<Room[]> {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&per_page=100`, {
            
        });

        if (!res.ok) return [];
        const data = await res.json();
        if (!Array.isArray(data)) return [];

        return data.sort((a, b) => {
            const noA = parseInt(a.acf?.room_no || '0', 10);
            const noB = parseInt(b.acf?.room_no || '0', 10);
            return noA - noB;
        });
    } catch (error) {
        return [];
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
    const allRooms = await getAllRooms();

    const currentRoomIdx = allRooms.findIndex(r => r.acf.room_no === decodeURIComponent(slug));
    const room = allRooms[currentRoomIdx];

    if (!room) {
        notFound();
    }

    const prevRoom = allRooms[currentRoomIdx - 1];
    const prevRoomNo = prevRoom?.acf?.room_no || null;
    const prevRoomTotalPhotos = prevRoom?.acf?.room_photos?.length || 0;
    const nextRoomNo = allRooms[currentRoomIdx + 1]?.acf?.room_no || null;

    return (
        <div className="room-photo-page">
            {children}

            <Suspense fallback={null}>
                <RoomPhotoFooter
                    roomNo={room.acf.room_no}
                    photoBy={room.acf.photo_by}
                    roomBy={room.acf.room_by}
                    totalPhotos={room.acf.room_photos?.length || 0}
                    nextRoomNo={nextRoomNo}
                    prevRoomNo={prevRoomNo}
                    prevRoomTotalPhotos={prevRoomTotalPhotos}
                />
            </Suspense>
        </div>
    );
}
