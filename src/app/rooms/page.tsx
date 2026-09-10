import { Metadata } from 'next';
import RoomsList, { RoomListItem } from '@/components/RoomsList';
import { getAllRooms, photoUrlOf } from '@/lib/rooms';

export const metadata: Metadata = {
    title: 'ROOMS',
};

export default async function RoomsPage() {
    const rooms = await getAllRooms();

    const items: RoomListItem[] = rooms.map((room) => {
        const thumbIdx = parseInt(room.acf?.thumbnail_no || '0', 10) - 1;
        const photos = Array.isArray(room.acf?.room_photos) ? room.acf.room_photos : [];
        const thumbnailUrl = (thumbIdx >= 0 && photoUrlOf(photos[thumbIdx]))
            || (typeof room.acf?.room_thumbnail === 'object' && room.acf.room_thumbnail?.url)
            || photoUrlOf(photos[0])
            || '';

        return {
            id: room.id,
            roomNo: room.acf?.room_no || '',
            roomBy: room.acf?.room_by || '',
            thumbnailUrl,
        };
    });

    return <RoomsList rooms={items} />;
}
