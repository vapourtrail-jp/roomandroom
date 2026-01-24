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
        room_thumbnail: RoomPhoto | number;
        room_photos: RoomPhotoItem[];
        thumbnail_no: string;
    };
}

async function getRooms(): Promise<Room[]> {
    const timestamp = Date.now();
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&per_page=100&_=${timestamp}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: {
                tags: ['rooms'],
                revalidate: 60
            }
        });

        if (!res.ok) return [];

        const data = await res.json();
        if (!Array.isArray(data)) return [];

        // room_no を数値として昇順ソート
        return data.sort((a, b) => {
            const noA = parseInt(a.acf?.room_no || '0', 10);
            const noB = parseInt(b.acf?.room_no || '0', 10);
            return noA - noB;
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
}

export default async function RoomsPage(props: {
    searchParams: Promise<{ sort?: string }>
}) {
    const searchParams = await props.searchParams;
    const sortOrder = searchParams.sort === 'desc' ? 'desc' : 'asc';
    let rooms = await getRooms();

    // ソート順に応じて並び替え
    if (sortOrder === 'desc') {
        rooms = [...rooms].sort((a, b) => {
            const noA = parseInt(a.acf?.room_no || '0', 10);
            const noB = parseInt(b.acf?.room_no || '0', 10);
            return noB - noA; // 降順
        });
    } else {
        rooms = [...rooms].sort((a, b) => {
            const noA = parseInt(a.acf?.room_no || '0', 10);
            const noB = parseInt(b.acf?.room_no || '0', 10);
            return noA - noB; // 昇順
        });
    }

    return (
        <div className="rooms-container">
            <div className="rooms-header">
                <h1 className="title">ROOMS</h1>
                <Link
                    href={`/rooms?sort=${sortOrder === 'asc' ? 'desc' : 'asc'}`}
                    className={`sort-toggle ${sortOrder === 'desc' ? 'is-desc' : ''}`}
                    title={sortOrder === 'asc' ? "降順に並び替え" : "昇順に並び替え"}
                >
                    <span className="material-symbols-rounded">sort</span>
                </Link>
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
                            <li
                                key={`${room.id}-${index}`}
                                className="l-list__item room-card-wrapper"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <Link href={`/rooms/${room.acf.room_no}/01`} className="room-card">
                                    <div className="room-card__thumbnail">
                                        {thumbnailUrl ? (
                                            <WobblyThumbnail
                                                src={thumbnailUrl}
                                                alt={room.acf.room_no || room.title?.rendered}
                                                initialDelay={index * 0.1}
                                            />
                                        ) : (
                                            <div className="room-card__no-image" style={{ height: '80px', width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', color: '#999' }}>NO IMAGE</div>
                                        )}
                                    </div>

                                    <div className="room-card__body">
                                        <p className="room-card__no">room*{room.acf?.room_no || room.title?.rendered}</p>

                                        <dl className="room-card__meta">
                                            {room.acf?.room_by && (
                                                <div className="room-card__owner">
                                                    <dt className="room-card__label">room by</dt>
                                                    <dd className="room-card__value">
                                                        {room.acf.room_by}
                                                    </dd>
                                                </div>
                                            )}
                                            {room.acf?.photo_by && (
                                                <div className="room-card__photographer">
                                                    <dt className="room-card__label">photo by </dt>
                                                    <dd className="room-card__value">
                                                        {room.acf.photo_by}
                                                    </dd>
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
