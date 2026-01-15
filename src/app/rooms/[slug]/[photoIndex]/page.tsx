import { notFound } from 'next/navigation';
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
        photoIndex: string;
    }>;
}

export default async function RoomPhotoPage({ params }: PageProps) {
    const { slug, photoIndex } = await params;
    const room = await getRoomByRoomNo(decodeURIComponent(slug));

    if (!room) {
        notFound();
    }

    const index = parseInt(photoIndex, 10);
    const photos = room.acf.room_photos || [];

    // インデックスが有効かチェック
    if (isNaN(index) || index < 1 || index > photos.length) {
        notFound();
    }

    const currentPhotoItem = photos[index - 1];
    const prevIndex = index > 1 ? index - 1 : null;
    const nextIndex = index < photos.length ? index + 1 : null;

    const padIndex = (idx: number) => idx.toString().padStart(2, '0');

    return (
        <div className="room-photo-page">
            <div className="room-photo-page__header">
                <Link href="/rooms" className="back-link">BACK TO LIST</Link>
                <h1 className="title">{room.acf.room_no}</h1>
            </div>

            <div className="room-photo-page__main">
                {prevIndex && (
                    <Link
                        href={`/rooms/${slug}/${padIndex(prevIndex)}`}
                        className="nav-button nav-button--prev"
                    >
                        &lt;
                    </Link>
                )}

                <div className="room-photo-page__image-container">
                    {typeof currentPhotoItem.room_photo === 'object' && currentPhotoItem.room_photo?.url && (
                        <img
                            src={currentPhotoItem.room_photo.url}
                            alt={currentPhotoItem.caption || `${room.acf.room_no} - ${photoIndex}`}
                            className="main-photo"
                        />
                    )}
                    {currentPhotoItem.caption && (
                        <p className="photo-caption">{currentPhotoItem.caption}</p>
                    )}
                </div>

                {nextIndex && (
                    <Link
                        href={`/rooms/${slug}/${padIndex(nextIndex)}`}
                        className="nav-button nav-button--next"
                    >
                        &gt;
                    </Link>
                )}
            </div>

            <div className="room-photo-page__footer">
                <p className="photo-counter">{index} / {photos.length}</p>
                <div className="room-info">
                    {room.acf.photo_by && <p className="meta-item">photo by: {room.acf.photo_by}</p>}
                    {room.acf.room_by && <p className="meta-item">room by: {room.acf.room_by}</p>}
                </div>
            </div>

        </div>
    );
}
