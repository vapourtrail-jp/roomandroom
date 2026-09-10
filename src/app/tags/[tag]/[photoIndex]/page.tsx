import { notFound } from 'next/navigation';
import ZoomableImage from '@/components/ZoomableImage';
import LocalPhotoContainer from '@/components/LocalPhotoContainer';
import { buildTagMap, getAllRooms, getTaggedPhotos, padIndex, photoUrlOf } from '@/lib/rooms';

// ビルド時に全タグ × 全写真を書き出す
export const dynamicParams = false;

export async function generateStaticParams() {
    const rooms = await getAllRooms();
    const params: { tag: string; photoIndex: string }[] = [];
    for (const [tag, photos] of buildTagMap(rooms)) {
        for (let i = 1; i <= photos.length; i++) {
            params.push({ tag, photoIndex: padIndex(i) });
        }
    }
    return params;
}

export default async function TagPhotoPage({
    params
}: {
    params: Promise<{ tag: string; photoIndex: string }>;
}) {
    const { tag, photoIndex } = await params;
    const decodedTag = decodeURIComponent(tag);
    const taggedPhotos = await getTaggedPhotos(decodedTag);

    const currentIndex = parseInt(photoIndex, 10);
    if (isNaN(currentIndex) || currentIndex < 1 || currentIndex > taggedPhotos.length) {
        notFound();
    }

    const currentPhoto = taggedPhotos[currentIndex - 1];
    const currentPhotoUrl = photoUrlOf(currentPhoto);

    return (
        <div className="room-photo-page__main">
            <LocalPhotoContainer>
                {currentPhotoUrl && (
                    <ZoomableImage
                        src={currentPhotoUrl}
                        alt={currentPhoto.caption || `${decodedTag} - ${photoIndex}`}
                        className="main-photo"
                    />
                )}
                {currentPhoto?.caption && (
                    <p className="photo-caption">{currentPhoto.caption} (room*{currentPhoto.room_no})</p>
                )}
            </LocalPhotoContainer>
        </div>
    );
}
