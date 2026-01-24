import { notFound } from 'next/navigation';
import ZoomableImage from '@/components/ZoomableImage';
import { Suspense } from 'react';
import LocalPhotoContainer from '@/components/LocalPhotoContainer';
import Link from 'next/link';

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
        room_by: string;
        photo_by: string;
        room_desc: string;
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

    // 00 (プロフィール) から photos.length までの範囲を許可
    if (isNaN(currentIndex) || currentIndex < 0 || currentIndex > photos.length) {
        notFound();
    }

    const currentPhotoItem = currentIndex > 0 ? photos[currentIndex - 1] : null;
    const padIndexLocal = (idx: number) => idx.toString().padStart(2, '0');

    // --- ナビゲーションパスの生成 ---
    const getPaths = () => {
        let prev = '/rooms';
        let next = '/rooms';

        // 前のルーム・写真の特定
        if (currentIndex > 0) {
            prev = `/rooms/${slug}/${padIndexLocal(currentIndex - 1)}`;
        } else {
            const prevRoom = allRooms[currentRoomIndex - 1];
            if (prevRoom) {
                const prevPhotos = prevRoom.acf.room_photos || [];
                prev = `/rooms/${prevRoom.acf.room_no}/${padIndexLocal(prevPhotos.length)}`;
            }
        }

        // 次のルーム・写真の特定
        if (currentIndex < photos.length) {
            next = `/rooms/${slug}/${padIndexLocal(currentIndex + 1)}`;
        } else {
            const nextRoom = allRooms[currentRoomIndex + 1];
            if (nextRoom) {
                next = `/rooms/${nextRoom.acf.room_no}/00`;
            }
        }
        return { prev, next };
    };

    const { prev: prevPath, next: nextPath } = getPaths();

    return (
        <div className="room-photo-page__main">
            <LocalPhotoContainer>
                {currentIndex === 0 ? (
                    /* 00 ページ: 写真の位置に room_desc を表示 */
                    <div className="profile-image-placeholder" style={{
                        width: '100%',
                        flex: 1,
                        minHeight: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 40px',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{
                            fontSize: '15px',
                            lineHeight: '1.8',
                            textAlign: 'center',
                            whiteSpace: 'pre-wrap',
                            maxWidth: '600px',
                            color: '#333'
                        }}>
                            {room.acf.room_desc}
                        </div>
                    </div>
                ) : (
                    /* 写真ページ */
                    <>
                        {currentPhotoItem && typeof currentPhotoItem.room_photo === 'object' && currentPhotoItem.room_photo?.url && (
                            <Suspense fallback={<div className="image-placeholder" />}>
                                <ZoomableImage
                                    src={currentPhotoItem.room_photo.url}
                                    alt={currentPhotoItem.caption || `${room.acf.room_no} - ${photoIndex}`}
                                    className="main-photo"
                                />
                            </Suspense>
                        )}
                        {currentPhotoItem?.caption && (
                            <p className="photo-caption">{currentPhotoItem.caption}</p>
                        )}
                    </>
                )}
            </LocalPhotoContainer>
        </div>
    );
}
