import { notFound } from 'next/navigation';
import ZoomableImage from '@/components/ZoomableImage';
import LocalPhotoContainer from '@/components/LocalPhotoContainer';
import { getAllRooms, padIndex, photoUrlOf } from '@/lib/rooms';

// ビルド時に全部屋 × 全写真（00 = PROFILE を含む）を書き出す
export const dynamicParams = false;

export async function generateStaticParams() {
    const rooms = await getAllRooms();
    const params: { slug: string; photoIndex: string }[] = [];
    for (const room of rooms) {
        const total = room.acf.room_photos?.length || 0;
        for (let i = 0; i <= total; i++) {
            params.push({ slug: room.acf.room_no, photoIndex: padIndex(i) });
        }
    }
    return params;
}

export default async function RoomPhotoPage({ params }: { params: Promise<{ slug: string; photoIndex: string }> }) {
    const { slug, photoIndex } = await params;
    const allRooms = await getAllRooms();
    const room = allRooms.find(r => r.acf.room_no === slug);

    if (!room) notFound();

    const currentIndex = parseInt(photoIndex, 10);
    const photos = room.acf.room_photos || [];
    const currentPhotoItem = currentIndex > 0 ? photos[currentIndex - 1] : null;
    const currentPhotoUrl = photoUrlOf(currentPhotoItem || undefined);

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
                        {currentPhotoUrl && (
                            <ZoomableImage
                                src={currentPhotoUrl}
                                alt={currentPhotoItem?.caption || `${room.acf.room_no} - ${photoIndex}`}
                                className="main-photo"
                            />
                        )}
                        {currentPhotoItem?.caption && <p className="photo-caption">{currentPhotoItem.caption}</p>}
                    </>
                )}
            </LocalPhotoContainer>
        </div>
    );
}
