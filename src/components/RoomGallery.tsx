'use client';

import { useState } from 'react';

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

interface RoomGalleryProps {
    photos: RoomPhotoItem[];
    roomName: string;
}

export default function RoomGallery({ photos, roomName }: RoomGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!photos || photos.length === 0) return null;

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? photos.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === photos.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const currentPhoto = photos[currentIndex].room_photo;
    const currentCaption = photos[currentIndex].caption;

    return (
        <div className="gallery-section">
            <div className="gallery-main">
                <button
                    className="gallery-button gallery-button--prev"
                    onClick={goToPrevious}
                    aria-label="Previous image"
                >
                    &lt;
                </button>

                <div className="gallery-image-container">
                    {currentPhoto?.url && (
                        <img
                            src={currentPhoto.url}
                            alt={currentPhoto.alt || `${roomName} - ${currentIndex + 1}`}
                            className="gallery-image"
                        />
                    )}
                </div>

                <button
                    className="gallery-button gallery-button--next"
                    onClick={goToNext}
                    aria-label="Next image"
                >
                    &gt;
                </button>
            </div>

            <div className="gallery-info">
                {currentCaption && <p className="gallery-caption">{currentCaption}</p>}
                <p className="gallery-counter">
                    {currentIndex + 1} / {photos.length}
                </p>
            </div>

            <div className="gallery-thumbnails">
                {photos.map((item, index) => (
                    <div
                        key={index}
                        className={`gallery-thumbnail-item ${index === currentIndex ? 'is-active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    >
                        {typeof item.room_photo === 'object' && item.room_photo?.url && (
                            <img src={item.room_photo.url} alt="" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
