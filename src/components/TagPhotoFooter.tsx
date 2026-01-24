'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface TagPhotoFooterProps {
    tag: string;
    totalPhotos: number;
    photoMetadata: {
        roomBy: string;
        photoBy: string;
        roomNo: string;
    }[];
}

export default function TagPhotoFooter({
    tag,
    totalPhotos,
    photoMetadata
}: TagPhotoFooterProps) {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const photoIndexStr = params?.photoIndex as string;

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentIndex = parseInt(photoIndexStr, 10) || 1;
    const isAutoplay = searchParams.get('ap') === '1';

    const [isNavigating, setIsNavigating] = useState(false);

    // 遷移が完了してインデックスが変わったら、ナビゲーション中フラグをリセットする
    useEffect(() => {
        setIsNavigating(false);
    }, [currentIndex, tag]);

    const getPaths = useCallback(() => {
        const padIndexLocal = (idx: number) => idx.toString().padStart(2, '0');
        const currentParams = searchParams.toString();
        const query = (mounted && currentParams) ? `?${currentParams}` : '';

        let prev = '/tags';
        let next = '/tags';

        // prev
        if (currentIndex > 1) {
            prev = `/tags/${tag}/${padIndexLocal(currentIndex - 1)}`;
        }

        // next
        if (currentIndex < totalPhotos) {
            next = `/tags/${tag}/${padIndexLocal(currentIndex + 1)}`;
        }

        return {
            prev: (prev === '/tags' || !mounted) ? prev : `${prev}${query}`,
            next: (next === '/tags' || !mounted) ? next : `${next}${query}`
        };
    }, [currentIndex, tag, totalPhotos, mounted, searchParams]);

    const { prev: prevPath, next: nextPath } = getPaths();

    const handleAutoNext = useCallback(() => {
        if (isAutoplay && mounted && !isNavigating) {
            setIsNavigating(true);
            router.push(nextPath);
        }
    }, [isAutoplay, mounted, isNavigating, nextPath, router]);

    const handleManualNav = () => {
        setIsNavigating(true);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isAutoplay && mounted && !isNavigating) {
            timer = setTimeout(handleAutoNext, 3000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isAutoplay, mounted, isNavigating, handleAutoNext]);

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

    const autoplayActive = mounted && isAutoplay;

    return (
        <div className="room-photo-page__footer">
            <div className="footer-title-row">
                <Link href={prevPath} className="footer-nav-button footer-nav-button--prev" onClick={handleManualNav}>
                    <span className="material-symbols-rounded">arrow_circle_left</span>
                </Link>

                <h1 className="title">
                    {decodeURIComponent(tag)}
                </h1>

                <Link href={nextPath} className="footer-nav-button footer-nav-button--next" onClick={handleManualNav}>
                    <span className="material-symbols-rounded">arrow_circle_right</span>
                </Link>
            </div>

            <div className="room-info">
                {photoMetadata[currentIndex - 1] && (
                    <>
                        {photoMetadata[currentIndex - 1].photoBy === photoMetadata[currentIndex - 1].roomBy ? (
                            photoMetadata[currentIndex - 1].photoBy && <span className="meta-item">room and photo by {photoMetadata[currentIndex - 1].photoBy}</span>
                        ) : (
                            <>
                                {photoMetadata[currentIndex - 1].roomBy && <span className="meta-item">room by {photoMetadata[currentIndex - 1].roomBy}</span>}
                                {photoMetadata[currentIndex - 1].photoBy && photoMetadata[currentIndex - 1].roomBy && <span className="meta-separator">/</span>}
                                {photoMetadata[currentIndex - 1].photoBy && <span className="meta-item">photo by {photoMetadata[currentIndex - 1].photoBy}</span>}
                            </>
                        )}
                        <span className="meta-separator"> / </span>
                        <Link href={`/rooms/${photoMetadata[currentIndex - 1].roomNo}/01`} className="meta-item" style={{ textDecoration: 'none' }}>
                            room*{photoMetadata[currentIndex - 1].roomNo}
                        </Link>
                    </>
                )}
            </div>

            <div style={{ marginTop: '12px' }}>
                <p className="photo-counter">
                    {mounted ? padIndex(currentIndex) : '01'} / {padIndex(totalPhotos)}
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
                        key={mounted ? `${tag}-${currentIndex}` : 'initial'}
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
