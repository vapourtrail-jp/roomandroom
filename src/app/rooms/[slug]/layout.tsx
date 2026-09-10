import { notFound } from 'next/navigation';
import RoomPhotoFooter from '@/components/RoomPhotoFooter';
import { getAllRooms } from '@/lib/rooms';

export default async function RoomLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const allRooms = await getAllRooms();

    const currentRoomIdx = allRooms.findIndex(r => r.acf.room_no === slug);
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

            <RoomPhotoFooter
                roomNo={room.acf.room_no}
                photoBy={room.acf.photo_by}
                roomBy={room.acf.room_by}
                totalPhotos={room.acf.room_photos?.length || 0}
                nextRoomNo={nextRoomNo}
                prevRoomNo={prevRoomNo}
                prevRoomTotalPhotos={prevRoomTotalPhotos}
            />
        </div>
    );
}
