'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface RoomPhotoFooterProps {
    roomNo: string;
    photoBy: string;
    roomBy: string;
    totalPhotos: number;
    nextRoomNo: string | null;
    prevRoomNo: string | null;
    prevRoomTotalPhotos: number;
}

export default function RoomPhotoFooter({
    roomNo,
    photoBy,
    roomBy,
    totalPhotos,
    nextRoomNo,
    prevRoomNo,
    prevRoomTotalPhotos
}: RoomPhotoFooterProps) {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = params?.slug as string;
    const photoIndexStr = params?.photoIndex as string;

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentIndex = parseInt(photoIndexStr, 10) || 0;
    const isAutoplay = searchParams.get('ap') === '1';

    const getPaths = useCallback(() => {
        const padIndexLocal = (idx: number) => idx.toString().padStart(2, '0');
        const currentParams = searchParams.toString();
        const query = (mounted && currentParams) ? `?${currentParams}` : '';

        let prev = '/rooms';
        let next = '/rooms';

        // Prev
        if (currentIndex > 1) {
            prev = `/rooms/${slug}/${padIndexLocal(currentIndex - 1)}`;
        } else if (prevRoomNo) {
            prev = `/rooms/${prevRoomNo}/${padIndexLocal(prevRoomTotalPhotos)}`;
        }

        // Next
        if (currentIndex < totalPhotos) {
            next = `/rooms/${slug}/${padIndexLocal(currentIndex + 1)}`;
        } else if (nextRoomNo) {
            next = `/rooms/${nextRoomNo}/01`;
        }

        return {
            prev: (prev === '/rooms' || !mounted) ? prev : `${prev}${query}`,
            next: (next === '/rooms' || !mounted) ? next : `${next}${query}`
        };
    }, [currentIndex, slug, totalPhotos, nextRoomNo, prevRoomNo, prevRoomTotalPhotos, mounted, searchParams]);

    const { prev: prevPath, next: nextPath } = getPaths();

    const handleAutoNext = useCallback(() => {
        if (isAutoplay && mounted) {
            router.push(nextPath);
        }
    }, [isAutoplay, mounted, nextPath, router]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isAutoplay && mounted) {
            timer = setTimeout(handleAutoNext, 3000);
        }
        return () => clearTimeout(timer);
    }, [isAutoplay, mounted, handleAutoNext]);

    const toggleAutoplay = () => {
        const nextAutoplay = !isAutoplay;
        const currentParams = new URLSearchParams(searchParams.toString());
        if (nextAutoplay) {
            currentParams.set('ap', '1');
        } else {
            currentParams.delete('ap');
        }
        router.replace(`${window.location.pathname}?${currentParams.toString()}`);
    };

    const showMetadata = mounted && currentIndex !== 0;
    const autoplayActive = mounted && isAutoplay;

    // 00ページではフッター要素を隠すが、レイアウトは維持する
    const footerVisibility = currentIndex === 0 ? 'hidden' : 'visible';

    return (
        <div className="room-photo-page__footer">
            <div className="footer-title-row">
                <Link href={prevPath} className="footer-nav-button footer-nav-button--prev">
                    <span className="material-symbols-rounded">arrow_circle_left</span>
                </Link>

                <h1 className="title">
                    room*{roomNo}
                </h1>

                <Link href={nextPath} className="footer-nav-button footer-nav-button--next">
                    <span className="material-symbols-rounded">arrow_circle_right</span>
                </Link>
            </div>

            <div className="room-info">
                {photoBy === roomBy ? (
                    photoBy && <span className="meta-item">room and photo by {photoBy}</span>
                ) : (
                    <>
                        {roomBy && <span className="meta-item">room by {roomBy}</span>}
                        {photoBy && roomBy && <span className="meta-separator">/</span>}
                        {photoBy && <span className="meta-item">photo by {photoBy}</span>}
                    </>
                )}
            </div>

            <div style={{ marginTop: '12px' }}>
                <p className="photo-counter">
                    {currentIndex === 0 ? 'PROFILE' : `${mounted ? padIndex(currentIndex) : '01'} / ${padIndex(totalPhotos)}`}
                </p>

                <div className="autoplay-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    <button
                        onClick={toggleAutoplay}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0px 10px',
                            color: '#000',
                            transition: 'opacity 0.3s'
                        }}
                    >
                        <span
                            className={`material-symbols-rounded ${mounted && isAutoplay ? 'is-filled' : ''}`}
                            style={{ fontSize: '20px', display: 'block' }}
                        >
                            play_arrow
                        </span>
                    </button>

                    <button
                        onClick={toggleAutoplay}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0px 10px',
                            color: '#000',
                            transition: 'opacity 0.3s'
                        }}
                    >
                        <span
                            className={`material-symbols-rounded ${mounted && !isAutoplay ? 'is-filled' : ''}`}
                            style={{ fontSize: '20px', display: 'block' }}
                        >
                            {mounted && !isAutoplay ? 'pause_circle' : 'pause'}
                        </span>
                    </button>
                </div>

                <div className="autoplay-progress-bar" style={{ visibility: autoplayActive ? 'visible' : 'hidden' }}>
                    <div
                        key={mounted ? `${roomNo}-${currentIndex}` : 'initial'}
                        className={`autoplay-progress-fill ${autoplayActive ? 'is-active' : ''}`}
                    />
                </div>
            </div>
        </div>
    );
}

function padIndex(idx: number) {
    return idx.toString().padStart(2, '0');
}
