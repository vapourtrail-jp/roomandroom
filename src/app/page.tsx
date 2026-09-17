import RoomsList from '@/components/RoomsList';
import { getAllRooms, toRoomListItems } from '@/lib/rooms';

export default async function Home() {
  // 一覧データはビルド時に埋め込む
  const rooms = await getAllRooms();
  return <RoomsList rooms={toRoomListItems(rooms)} basePath="/" />;
}
