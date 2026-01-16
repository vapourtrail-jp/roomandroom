'use client';

import { useParams } from 'next/navigation';

interface RoomPhotoFooterProps {
    roomNo: string;
    photoBy: string;
    roomBy: string;
    totalPhotos: number;
}

export default function RoomPhotoFooter({ roomNo, photoBy, roomBy, totalPhotos }: RoomPhotoFooterProps) {
    const params = useParams();
    const photoIndex = params.photoIndex as string;
    const index = parseInt(photoIndex, 10);

    return (
        <div className="room-photo-page__footer">
            <h1 className="title" style={{ marginBottom: '7px' }}>room*{roomNo}</h1>
            <div className="room-info">
                {photoBy === roomBy ? (
                    photoBy && <span className="meta-item">room and photo by: {photoBy}</span>
                ) : (
                    <>
                        {photoBy && <span className="meta-item">photo by: {photoBy}</span>}
                        {photoBy && roomBy && <span className="meta-separator" style={{ margin: '0 4px' }}>/</span>}
                        {roomBy && <span className="meta-item">room by: {roomBy}</span>}
                    </>
                )}
            </div>
            {index > 0 && (
                <p className="photo-counter" style={{ marginTop: '20px' }}>
                    {index} / {totalPhotos}
                </p>
            )}
        </div>
    );
}
