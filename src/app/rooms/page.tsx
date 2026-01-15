import Link from 'next/link';

export const runtime = 'edge';

interface RoomPhoto {
    id: number;
    title: string;
    url: string;
    width: number;
    height: number;
    alt: string;
}

// ACFの「画像」フィールドが配列（Gallery）の場合の構造
interface RoomPhotoItem {
    caption: string;
    room_photo: RoomPhoto | number;
}

interface Room {
    id: number;
    title: {
        rendered: string;
    };
    acf: {
        room_no: string;
        room_by: string;          // オーナー
        photo_by: string;         // 撮影者
        room_desc: string;        // 説明文
        sns_instagram: string;    // Instagram
        sns_x: string;            // X
        photo_count: string;      // 枚数
        room_thumbnail: RoomPhoto | number;
        room_photos: RoomPhotoItem[];
    };
}

async function getRooms(): Promise<Room[]> {
    const timestamp = Date.now();
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&_=${timestamp}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: {
                tags: ['rooms'],
                revalidate: 0
            }
        });

        if (!res.ok) return [];

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
}

export default async function RoomsPage() {
    const rooms = await getRooms();

    return (
        <div className="rooms-container">
            <h1 className="title">ROOMS</h1>

            {rooms.length === 0 ? (
                <p className="no-data">現在表示できるデータがありません。</p>
            ) : (
                <ul className="l-list">
                    {rooms.map((room) => {
                        // サムネイルURLの優先順：
                        // 1. room_thumbnail の URL
                        // 2. room_photos[0] の URL
                        const thumbnailUrl = (typeof room.acf?.room_thumbnail === 'object' && room.acf.room_thumbnail?.url)
                            || (Array.isArray(room.acf?.room_photos) && typeof room.acf.room_photos[0]?.room_photo === 'object' && room.acf.room_photos[0].room_photo?.url)
                            || '';

                        return (
                            <li key={room.id} className="l-list__item">
                                <Link href={`/details/${room.id}`} className="room-card">
                                    <div className="room-card__thumbnail">
                                        {thumbnailUrl ? (
                                            <img
                                                src={thumbnailUrl}
                                                alt={room.acf.room_no || room.title?.rendered}
                                                className="room-card__image"
                                            />
                                        ) : (
                                            <div className="room-card__no-image" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', color: '#999' }}>NO IMAGE</div>
                                        )}
                                    </div>

                                    <div className="room-card__body">
                                        <p className="room-card__no">{room.acf?.room_no || room.title?.rendered}</p>

                                        <dl className="room-card__meta">
                                            <div className="room-card__photographer">
                                                <dt className="room-card__label">Photo</dt>
                                                <dd className="room-card__value">
                                                    {room.acf?.photo_by || '田中'}
                                                </dd>
                                            </div>
                                            <div className="room-card__owner">
                                                <dt className="room-card__label">room</dt>
                                                <dd className="room-card__value">
                                                    @{room.acf?.room_by || 'design'}
                                                </dd>
                                            </div>
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

