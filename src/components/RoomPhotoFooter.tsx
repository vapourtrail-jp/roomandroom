'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useCallback } from 'react';

interface RoomPhotoFooterProps {
    roomNo: string;
    photoBy: string;
    roomBy: string;
    totalPhotos: number;
    nextRoomNo: string | null;
}

export default function RoomPhotoFooter({
    roomNo,
    photoBy,
    roomBy,
    totalPhotos,
    nextRoomNo
}: RoomPhotoFooterProps) {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const photoIndex = params.photoIndex as string;
    const currentIndex = parseInt(photoIndex, 10);
    const isAutoplay = searchParams.get('ap') === '1';
    const isZoomed = searchParams.get('z') === '1';

    // 次のパスを計算
    const getNextPath = useCallback(() => {
        const padIndex = (idx: number) => idx.toString().padStart(2, '0');
        if (currentIndex < totalPhotos) {
            // 同一ルーム内の次の写真
            return `/rooms/${roomNo}/${padIndex(currentIndex + 1)}`;
        } else if (nextRoomNo) {
            // 次のルームの 00 ページへ
            return `/rooms/${nextRoomNo}/00`;
        }
        // 最後の場合は一覧に戻る
        return '/rooms';
    }, [currentIndex, totalPhotos, roomNo, nextRoomNo]);

    // 自動遷移の実行
    useEffect(() => {
        if (!isAutoplay) return;

        const timer = setTimeout(() => {
            const nextPath = getNextPath();
            if (nextPath === '/rooms') {
                router.push(nextPath);
                return;
            }

            // クエリパラメータの構築
            const params = new URLSearchParams();
            params.set('ap', '1');
            if (isZoomed) params.set('z', '1');

            router.push(`${nextPath}?${params.toString()}`);
        }, 4000); // 4秒で遷移

        return () => clearTimeout(timer);
    }, [isAutoplay, isZoomed, getNextPath, router]);

    const handlePlay = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('ap', '1');
        router.push(`${window.location.pathname}?${params.toString()}`);
    };

    const handleStop = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('ap');
        const query = params.toString();
        router.push(`${window.location.pathname}${query ? '?' + query : ''}`);
    };

    return (
        <div className="room-photo-page__footer">
            <div style={{ visibility: currentIndex === 0 ? 'hidden' : 'visible' }}>
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
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <p className="photo-counter" style={{ margin: 0, visibility: currentIndex === 0 ? 'hidden' : 'visible' }}>
                    {currentIndex} / {totalPhotos}
                </p>

                <div className="autoplay-controls" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '15px' }}>
                    <button
                        onClick={handlePlay}
                        title="PLAY"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            opacity: isAutoplay ? 1 : 0.4,
                            color: '#000',
                            transition: 'opacity 0.3s'
                        }}
                    >
                        <span
                            className={`material-symbols-rounded ${isAutoplay ? 'is-filled' : ''}`}
                            style={{ fontSize: '20px', display: 'block' }}
                        >
                            {isAutoplay ? 'play_circle' : 'play_arrow'}
                        </span>
                    </button>
                    <button
                        onClick={handleStop}
                        title="STOP"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            opacity: !isAutoplay ? 1 : 0.4,
                            color: '#000',
                            transition: 'opacity 0.3s'
                        }}
                    >
                        <span
                            className={`material-symbols-rounded ${!isAutoplay ? 'is-filled' : ''}`}
                            style={{ fontSize: '20px', display: 'block' }}
                        >
                            {!isAutoplay ? 'pause_circle' : 'pause'}
                        </span>
                    </button>
                </div>

                <div className="autoplay-progress-bar" style={{ visibility: isAutoplay ? 'visible' : 'hidden' }}>
                    <div
                        key={`${roomNo}-${currentIndex}`}
                        className={`autoplay-progress-fill ${isAutoplay ? 'is-active' : ''}`}
                    />
                </div>
            </div>
        </div>
    );
}
