import { Metadata } from 'next';
import RoomsList from '@/components/RoomsList';
import { getAllRooms, toRoomListItems } from '@/lib/rooms';

export const metadata: Metadata = {
    title: 'ROOMS',
};

export default async function RoomsPage() {
    const rooms = await getAllRooms();
    return <RoomsList rooms={toRoomListItems(rooms)} basePath="/rooms" />;
}
