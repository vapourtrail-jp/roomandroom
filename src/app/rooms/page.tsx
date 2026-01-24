import { Metadata } from 'next';
import Link from 'next/link';
import WobblyThumbnail from '@/components/WobblyThumbnail';



export const metadata: Metadata = {
    title: 'ROOMS',
};

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
    room_photo: RoomPhoto | number;
}

interface Room {
    id: number;
    slug: string;
    title: { rendered: string };
    acf: {
        room_no: string;
        room_by: string;
        photo_by: string;
        room_desc: string;
        sns_instagram: string;
        sns_x: string;
        photo_count: string;
        room_thumbnail: RoomPhoto | number;
        room_photos: RoomPhotoItem[];
        thumbnail_no: string;
    };
}

async function getRooms(): Promise<Room[]> {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&per_page=100`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        if (!Array.isArray(data)) return [];
        return data.sort((a, b) => parseInt(a.acf?.room_no || '0', 10) - parseInt(b.acf?.room_no || '0', 10));
    } catch (error) {
        return [];
    }
}

export default async function RoomsPage() {
    let rooms = await getRooms();

    return (
        <div className="rooms-container">
            <div className="rooms-header">
                <h1 className="title">ROOMS</h1>
            </div>
            {rooms.length === 0 ? (
                <p className="no-data">現在表示できるデータがありません。</p>
            ) : (
                <ul className="l-list">
                    {rooms.map((room, index) => {
                        const thumbIdx = parseInt(room.acf?.thumbnail_no || '0', 10) - 1;
                        const thumbnailUrl = (thumbIdx >= 0 && Array.isArray(room.acf?.room_photos) && typeof room.acf.room_photos[thumbIdx]?.room_photo === 'object' && room.acf.room_photos[thumbIdx].room_photo?.url)
                            || (typeof room.acf?.room_thumbnail === 'object' && room.acf.room_thumbnail?.url)
                            || (Array.isArray(room.acf?.room_photos) && typeof room.acf.room_photos[0]?.room_photo === 'object' && room.acf.room_photos[0].room_photo?.url)
                            || '';

                        return (
                            <li key={`${room.id}-${index}`} className="l-list__item room-card-wrapper" style={{ animationDelay: `${index * 0.1}s` }}>
                                {/* 直接詳細ページ (/01) へリンク */}
                                <Link href={`/rooms/${room.acf.room_no}/01`} className="room-card">
                                    <div className="room-card__thumbnail">
                                        {thumbnailUrl ? (
                                            <WobblyThumbnail src={thumbnailUrl} alt={room.acf.room_no} initialDelay={index * 0.1} />
                                        ) : (
                                            <div className="room-card__no-image" style={{ height: '80px', width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', color: '#999' }}>NO IMAGE</div>
                                        )}
                                    </div>
                                    <div className="room-card__body">
                                        <p className="room-card__no">room*{room.acf?.room_no}</p>
                                        <dl className="room-card__meta">
                                            {room.acf?.room_by && (
                                                <div className="room-card__owner">
                                                    <dt className="room-card__label">room by</dt>
                                                    <dd className="room-card__value">{room.acf.room_by}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
