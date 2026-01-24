import { notFound } from 'next/navigation';
import ZoomableImage from '@/components/ZoomableImage';
import { Suspense } from 'react';
import LocalPhotoContainer from '@/components/LocalPhotoContainer';

export const runtime = 'edge';

interface RoomPhoto {
    id: number;
    url: string;
}

interface RoomPhotoItem {
    caption: string;
    room_photo: RoomPhoto;
    tags?: string;
}

interface Room {
    id: number;
    acf: {
        room_no: string;
        room_photos: RoomPhotoItem[];
    };
}

async function getAllRooms(): Promise<Room[]> {
    try {
        const res = await fetch(`https://cms.roomandroom.org/wp-json/wp/v2/rooms?acf_format=standard&per_page=100`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        if (!Array.isArray(data)) return [];

        // レイアウト側と100%同じソート順を保証（キャプションの不一致を解消）
        return data.sort((a, b) => {
            const noA = parseInt(a.acf?.room_no || '0', 10);
            const noB = parseInt(b.acf?.room_no || '0', 10);
            return noA - noB;
        });
    } catch (error) {
        return [];
    }
}

export default async function TagPhotoPage({
    params
}: {
    params: Promise<{ tag: string; photoIndex: string }>;
}) {
    const { tag, photoIndex } = await params;
    const decodedTag = decodeURIComponent(tag);
    const allRooms = await getAllRooms();

    const taggedPhotos = allRooms.flatMap(room => {
        const photos = room.acf.room_photos || [];
        return photos
            .filter(photo => {
                const tagString = photo.tags || '';
                const tagsArray = tagString.split(/[,\s]+/).map(t => t.trim());
                return tagsArray.includes(decodedTag);
            })
            .map(photo => ({
                ...photo,
                room_no: room.acf.room_no
            }));
    });

    const currentIndex = parseInt(photoIndex, 10);
    if (isNaN(currentIndex) || currentIndex < 1 || currentIndex > taggedPhotos.length) {
        notFound();
    }

    const currentPhoto = taggedPhotos[currentIndex - 1];

    return (
        <div className="room-photo-page__main">
            <LocalPhotoContainer>
                {currentPhoto && typeof currentPhoto.room_photo === 'object' && currentPhoto.room_photo?.url && (
                    <Suspense fallback={<div className="image-placeholder" />}>
                        <ZoomableImage
                            src={currentPhoto.room_photo.url}
                            alt={currentPhoto.caption || `${decodedTag} - ${photoIndex}`}
                            className="main-photo"
                        />
                    </Suspense>
                )}
                {currentPhoto?.caption && (
                    <p className="photo-caption">{currentPhoto.caption} (room*{currentPhoto.room_no})</p>
                )}
            </LocalPhotoContainer>
        </div>
    );
}
