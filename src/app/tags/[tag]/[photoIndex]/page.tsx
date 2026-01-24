import { notFound } from 'next/navigation';
import ZoomableImage from '@/components/ZoomableImage';
import { Suspense } from 'react';
import LocalPhotoContainer from '@/components/LocalPhotoContainer';

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
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&per_page=100`, {
            cache: 'force-cache'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

// ビルド時に実際に存在する全てのタグと写真インデックスの組み合わせを生成
export async function generateStaticParams() {
    const allRooms = await getAllRooms();
    const paths: { tag: string; photoIndex: string }[] = [];

    const tagCounts = new Map<string, number>();

    allRooms.forEach(room => {
        const photos = room.acf.room_photos || [];
        photos.forEach(photo => {
            const tags = (photo.tags || '').split(/[,\s]+/).filter(t => t.trim() !== '');
            tags.forEach(t => {
                const decodedTag = t.trim();
                const currentCount = tagCounts.get(decodedTag) || 0;
                tagCounts.set(decodedTag, currentCount + 1);
            });
        });
    });

    // 各タグについて、実際に存在する写真の枚数分だけパスを生成
    tagCounts.forEach((count, tag) => {
        for (let i = 1; i <= count; i++) {
            paths.push({
                tag: encodeURIComponent(tag),
                photoIndex: i.toString().padStart(2, '0')
            });
        }
    });

    return paths;
}

export default async function TagPhotoPage({
    params
}: {
    params: Promise<{ tag: string; photoIndex: string }>;
}) {
    const { tag, photoIndex } = await params;
    const decodedTag = decodeURIComponent(tag);
    const allRooms = await getAllRooms();

    // 全ルームから指定されたタグを持つ写真を抽出
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
