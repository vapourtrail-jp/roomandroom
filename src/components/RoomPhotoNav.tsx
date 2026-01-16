'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface RoomPhotoNavProps {
    slug: string;
    prevIndex: number | null;
    nextIndex: number | null;
}

export default function RoomPhotoNav({ slug, prevIndex, nextIndex }: RoomPhotoNavProps) {
    const searchParams = useSearchParams();
    const isZoomed = searchParams.get('z') === '1';
    const zoomQuery = isZoomed ? '?z=1' : '';

    const padIndex = (idx: number) => idx.toString().padStart(2, '0');

    return (
        <>
            <Link
                href={prevIndex ? `/rooms/${slug}/${padIndex(prevIndex)}${zoomQuery}` : '/rooms'}
                className="nav-button nav-button--prev"
            >
                &lt;
            </Link>

            <Link
                href={nextIndex ? `/rooms/${slug}/${padIndex(nextIndex)}${zoomQuery}` : '/rooms'}
                className="nav-button nav-button--next"
            >
                &gt;
            </Link>
        </>
    );
}
