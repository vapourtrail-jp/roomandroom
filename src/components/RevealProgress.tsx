'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

interface RevealProgressProps {
    progress: number; // 0〜1（画像の読み込みと表示完了の遅い方）
}

/**
 * 画面最上部の 1px プログレスバー。実際の進み具合（progress）に追従し、
 * 100% に達してから消える。main の中に置くとヘッダーの下に隠れるため body 直下に描く。
 */
export default function RevealProgress({ progress }: RevealProgressProps) {
    const [host, setHost] = useState<HTMLElement | null>(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        setHost(document.body);
    }, []);

    // 100% → 右端に伸び切るのを待ってから消す。途中に戻ったら（並び替え）再表示
    useEffect(() => {
        if (progress < 1) {
            setDone(false);
            return;
        }
        const t = window.setTimeout(() => setDone(true), 350);
        return () => window.clearTimeout(t);
    }, [progress]);

    if (!host) return null;
    return createPortal(
        <div
            className={`reveal-progress ${done ? 'is-done' : ''}`}
            aria-hidden="true"
            style={{ '--reveal-progress': String(Math.max(0, Math.min(1, progress))) } as CSSProperties}
        />,
        host
    );
}
