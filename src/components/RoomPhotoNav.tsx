'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface RoomPhotoNavProps {
    prevHref: string;
    nextHref: string;
}

export default function RoomPhotoNav({ prevHref, nextHref }: RoomPhotoNavProps) {
    const searchParams = useSearchParams();
    const currentParams = searchParams.toString();
    const query = currentParams ? `?${currentParams}` : '';

    // rooms 一覧へのリンクの場合はクエリを付けない
    const finalPrevHref = prevHref === '/rooms' ? prevHref : `${prevHref}${query}`;
    const finalNextHref = nextHref === '/rooms' ? nextHref : `${nextHref}${query}`;

    return (
        <>
            <Link
                href={finalPrevHref}
                className="nav-button nav-button--prev"
            >
                <span className="material-symbols-rounded" style={{ fontSize: '40px' }}>chevron_left</span>
            </Link>

            <Link
                href={finalNextHref}
                className="nav-button nav-button--next"
            >
                <span className="material-symbols-rounded" style={{ fontSize: '40px' }}>chevron_right</span>
            </Link>
        </>
    );
}
