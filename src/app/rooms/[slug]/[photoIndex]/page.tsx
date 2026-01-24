import { notFound } from 'next/navigation';
import ZoomableImage from '@/components/ZoomableImage';
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
        room_by: string;
        photo_by: string;
        room_desc: string;
        room_photos: RoomPhotoItem[];
    };
}

async function getAllRooms(): Promise<Room[]> {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&per_page=100`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

export default async function RoomPhotoPage({ params }: { params: Promise<{ slug: string; photoIndex: string }> }) {
    const { slug, photoIndex } = await params;
    const allRooms = await getAllRooms();
    const room = allRooms.find(r => r.acf.room_no === slug);

    if (!room) notFound();

    const currentIndex = parseInt(photoIndex, 10);
    const photos = room.acf.room_photos || [];
    const currentPhotoItem = currentIndex > 0 ? photos[currentIndex - 1] : null;

    return (
        <div className="room-photo-page__main">
            <LocalPhotoContainer>
                {currentIndex === 0 ? (
                    <div className="profile-image-placeholder" style={{ width: '100%', flex: 1, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px', boxSizing: 'border-box' }}>
                        <div style={{ fontSize: '15px', lineHeight: '1.8', textAlign: 'center', whiteSpace: 'pre-wrap', maxWidth: '600px', color: '#333' }}>
                            {room.acf.room_desc}
                        </div>
                    </div>
                ) : (
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
                        {currentPhotoItem?.caption && <p className="photo-caption">{currentPhotoItem.caption}</p>}
                    </>
                )}
            </LocalPhotoContainer>
        </div>
    );
}
