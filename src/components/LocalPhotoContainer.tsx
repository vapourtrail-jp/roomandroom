'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface LocalPhotoContainerProps {
    children: ReactNode;
}

export default function LocalPhotoContainer({ children }: LocalPhotoContainerProps) {
    const pathname = usePathname();

    return (
        <div
            key={pathname}
            className="room-photo-page__image-container animate-fade-in"
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
        >
            {children}
        </div>
    );
}
