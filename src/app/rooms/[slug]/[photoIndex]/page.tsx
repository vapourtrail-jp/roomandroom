import { notFound } from 'next/navigation';
import ZoomableImage from '@/components/ZoomableImage';
import RoomPhotoNav from '@/components/RoomPhotoNav';
import { Suspense } from 'react';
import LocalPhotoContainer from '@/components/LocalPhotoContainer';

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
    acf: {
        room_no: string;
        room_photos: RoomPhotoItem[];
    };
}

// 全ルームを取得する関数 (順序維持のため)
async function getAllRooms(): Promise<Room[]> {
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

interface PageProps {
    params: Promise<{
        slug: string;
        photoIndex: string;
    }>;
}

export default async function RoomPhotoPage({ params }: PageProps) {
    const { slug, photoIndex } = await params;
    const allRooms = await getAllRooms();

    // 現在のルームを特定
    const currentRoomIndex = allRooms.findIndex(r => r.acf.room_no === decodeURIComponent(slug));
    const room = allRooms[currentRoomIndex];

    if (!room) {
        notFound();
    }

    const currentIndex = parseInt(photoIndex, 10);
    const photos = room.acf.room_photos || [];

    if (isNaN(currentIndex) || currentIndex < 1 || currentIndex > photos.length) {
        notFound();
    }

    const currentPhotoItem = photos[currentIndex - 1];
    const padIndex = (idx: number) => idx.toString().padStart(2, '0');

    // --- ナビゲーションリンクの生成 ---
    let prevHref = '/rooms';
    let nextHref = '/rooms';

    // 前へのリンク
    if (currentIndex > 1) {
        // 同一ルーム内の前の写真
        prevHref = `/rooms/${slug}/${padIndex(currentIndex - 1)}`;
    } else {
        // ルームの最初の写真なので、前のルームの最後の写真へ
        const prevRoom = allRooms[currentRoomIndex - 1];
        if (prevRoom) {
            const prevRoomPhotos = prevRoom.acf.room_photos || [];
            const lastPhotoIdx = prevRoomPhotos.length;
            prevHref = `/rooms/${prevRoom.acf.room_no}/${padIndex(lastPhotoIdx)}`;
        }
    }

    // 次へのリンク
    if (currentIndex < photos.length) {
        // 同一ルーム内の次の写真
        nextHref = `/rooms/${slug}/${padIndex(currentIndex + 1)}`;
    } else {
        // ルームの最後の写真なので、次のルームの1枚目へ
        const nextRoom = allRooms[currentRoomIndex + 1];
        if (nextRoom) {
            nextHref = `/rooms/${nextRoom.acf.room_no}/01`;
        }
    }

    return (
        <div className="room-photo-page__main">
            <Suspense fallback={<div className="nav-placeholder" />}>
                <RoomPhotoNav
                    prevHref={prevHref}
                    nextHref={nextHref}
                />
            </Suspense>

            <LocalPhotoContainer>
                {typeof currentPhotoItem.room_photo === 'object' && currentPhotoItem.room_photo?.url && (
                    <Suspense fallback={<div className="image-placeholder" />}>
                        <ZoomableImage
                            src={currentPhotoItem.room_photo.url}
                            alt={currentPhotoItem.caption || `${room.acf.room_no} - ${photoIndex}`}
                            className="main-photo"
                        />
                    </Suspense>
                )}
                {currentPhotoItem.caption && (
                    <p className="photo-caption">{currentPhotoItem.caption}</p>
                )}
            </LocalPhotoContainer>
        </div>
    );
}
