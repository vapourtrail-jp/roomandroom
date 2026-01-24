import { notFound } from 'next/navigation';
import TagPhotoFooter from '@/components/TagPhotoFooter';
import { Suspense } from 'react';

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
        room_by: string;
        photo_by: string;
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

        return data.sort((a, b) => {
            const noA = parseInt(a.acf?.room_no || '0', 10);
            const noB = parseInt(b.acf?.room_no || '0', 10);
            return noA - noB;
        });
    } catch (error) {
        return [];
    }
}

export default async function TagLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ tag: string }>;
}) {
    const { tag } = await params;
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
                room_no: room.acf.room_no,
                room_by: room.acf.room_by,
                photo_by: room.acf.photo_by
            }));
    });

    if (taggedPhotos.length === 0) {
        notFound();
    }

    const photoMetadata = taggedPhotos.map(p => ({
        roomBy: p.room_by,
        photoBy: p.photo_by,
        roomNo: p.room_no
    }));

    return (
        <div className="room-photo-page">
            {children}

            <Suspense fallback={null}>
                <TagPhotoFooter
                    tag={tag}
                    totalPhotos={taggedPhotos.length}
                    photoMetadata={photoMetadata}
                />
            </Suspense>
        </div>
    );
}
