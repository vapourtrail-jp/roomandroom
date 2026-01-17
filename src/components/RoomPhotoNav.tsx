'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface RoomPhotoNavProps {
    prevHref: string;
    nextHref: string;
}

export default function RoomPhotoNav({ prevHref, nextHref }: RoomPhotoNavProps) {
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentParams = searchParams.toString();
    const query = (mounted && currentParams) ? `?${currentParams}` : '';

    // rooms 一覧へのリンクの場合はクエリを付けない
    const finalPrevHref = (prevHref === '/rooms' || !mounted) ? prevHref : `${prevHref}${query}`;
    const finalNextHref = (nextHref === '/rooms' || !mounted) ? nextHref : `${nextHref}${query}`;

    return (
        <div className="room-photo-nav">
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
        </div>
    );
}
