'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface RoomPhotoNavProps {
    prevHref: string;
    nextHref: string;
}

export default function RoomPhotoNav({ prevHref, nextHref }: RoomPhotoNavProps) {
    const searchParams = useSearchParams();
    const isZoomed = searchParams.get('z') === '1';
    const zoomQuery = isZoomed ? '?z=1' : '';

    // rooms 一覧へのリンクの場合はズームクエリを付けない
    const finalPrevHref = prevHref === '/rooms' ? prevHref : `${prevHref}${zoomQuery}`;
    const finalNextHref = nextHref === '/rooms' ? nextHref : `${nextHref}${zoomQuery}`;

    return (
        <>
            <Link
                href={finalPrevHref}
                className="nav-button nav-button--prev"
            >
                &lt;
            </Link>

            <Link
                href={finalNextHref}
                className="nav-button nav-button--next"
            >
                &gt;
            </Link>
        </>
    );
}
