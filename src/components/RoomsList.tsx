'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import WobblyThumbnail from '@/components/WobblyThumbnail';
import RevealProgress from '@/components/RevealProgress';
import type { RoomListItem } from '@/lib/rooms';

export type { RoomListItem };

interface RoomsListProps {
    rooms: RoomListItem[]; // room_no 昇順
    basePath?: string; // 並び替え時に書き換える URL のパス（'/' または '/rooms'）
}

export default function RoomsList({ rooms, basePath = '/rooms' }: RoomsListProps) {
    // 初期表示は昇順（静的 HTML と一致）。?sort=desc はマウント後に反映する。
    const [isAsc, setIsAsc] = useState(true);

    useEffect(() => {
        const read = () => setIsAsc(new URLSearchParams(window.location.search).get('sort') !== 'desc');
        read();
        window.addEventListener('popstate', read);
        return () => window.removeEventListener('popstate', read);
    }, []);

    const handleToggle = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const next = !isAsc;
        setIsAsc(next);
        setRevealedIds(new Set());
        setLoadedIds(new Set());
        window.history.pushState(null, '', `${basePath}?sort=${next ? 'asc' : 'desc'}`);
    };

    const sorted = [...rooms].sort((a, b) => {
        const noA = parseInt(a.roomNo || '0', 10);
        const noB = parseInt(b.roomNo || '0', 10);
        return isAsc ? noA - noB : noB - noA;
    });

    // プログレス: 画像の読み込み完了数と、登場アニメーションの完了数を別々に数え、遅い方をバーに出す
    const [loadedIds, setLoadedIds] = useState<Set<number>>(() => new Set());
    const [revealedIds, setRevealedIds] = useState<Set<number>>(() => new Set());
    const markLoaded = useCallback((id: number) => setLoadedIds((s) => (s.has(id) ? s : new Set(s).add(id))), []);
    const markRevealed = useCallback((id: number) => setRevealedIds((s) => (s.has(id) ? s : new Set(s).add(id))), []);
    const total = sorted.length;
    const progress = total === 0 ? 1 : Math.min(loadedIds.size, revealedIds.size) / total;

    return (
        <div className="rooms-container">
            {/* 並び替えでサムネイルが出直すので、そのたびにバーも最初から */}
            <RevealProgress progress={progress} />
            <div className="rooms-header">
                <h1 className="title">ROOMS</h1>
                <a
                    href={`${basePath}?sort=${isAsc ? 'desc' : 'asc'}`}
                    onClick={handleToggle}
                    className={`sort-toggle ${!isAsc ? 'is-desc' : ''}`}
                    title={isAsc ? '新しい順に並び替え' : '古い順に並び替え'}
                >
                    <span className="material-symbols-rounded">expand_more</span>
                </a>
            </div>
            {sorted.length === 0 ? (
                <p className="no-data">現在表示できるデータがありません。</p>
            ) : (
                <ul className="l-list">
                    {sorted.map((room, index) => (
                        <li
                            key={`${room.id}-${index}`}
                            className="l-list__item room-card-wrapper"
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onAnimationEnd={() => markRevealed(room.id)}
                        >
                            <Link href={`/rooms/${room.roomNo}/01`} className="room-card">
                                <div className="room-card__thumbnail">
                                    {room.thumbnailUrl ? (
                                        <WobblyThumbnail src={room.thumbnailUrl} alt={room.roomNo} uid={`room-${room.id}`} initialDelay={index * 0.1} onLoaded={() => markLoaded(room.id)} />
                                    ) : (
                                        <div ref={() => markLoaded(room.id)} className="room-card__no-image" style={{ height: '80px', width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', color: '#999' }}>NO IMAGE</div>
                                    )}
                                </div>
                                <div className="room-card__body">
                                    <p className="room-card__no">room*{room.roomNo}</p>
                                    <dl className="room-card__meta">
                                        {room.roomBy && (
                                            <div className="room-card__owner">
                                                <dt className="room-card__label">room by</dt>
                                                <dd className="room-card__value">{room.roomBy}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
