'use client';

import { useState } from 'react';

interface ZoomableImageProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
    const [isSmall, setIsSmall] = useState(false);

    const handleToggleZoom = () => {
        setIsSmall(!isSmall);
    };

    const size = isSmall ? '480px' : '600px';
    const maxHeight = isSmall ? '480px' : '600px';

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} ${isSmall ? 'is-small' : 'is-large'}`}
            onClick={handleToggleZoom}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            style={{
                cursor: isSmall ? 'zoom-in' : 'zoom-out',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                width: '100%',
                height: '100%',
                maxWidth: size,
                maxHeight: maxHeight,
                minHeight: 0, // Flex内で縮小可能にする
                transition: 'max-width 0.3s ease-in-out, max-height 0.3s ease-in-out'
            }}
        />
    );
}
