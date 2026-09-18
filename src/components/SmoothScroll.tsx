'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

// ============================================================
// 慣性スクロールの設定（PC のホイール／トラックパッドのみ。スマホの指スクロールは標準のまま）
// ============================================================
const SMOOTH_SCROLL_CONFIG = {
    enabled: true,
    duration: 1.1,        // 目標位置に着くまでの秒数（大きいほどぬるっと）
    wheelMultiplier: 1,   // ホイール 1 回で進む量の倍率
    smoothTouch: false,   // タッチ操作も乗っ取るか（false = OS 標準）
};

export default function SmoothScroll() {
    useEffect(() => {
        const c = SMOOTH_SCROLL_CONFIG;
        if (!c.enabled) return;
        // 「視差効果を減らす」設定の人には適用しない
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({
            duration: c.duration,
            wheelMultiplier: c.wheelMultiplier,
            syncTouch: c.smoothTouch,
            // 減速カーブ（Lenis 既定の easeOutExpo 系）
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        let frame = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            frame = requestAnimationFrame(raf);
        };
        frame = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(frame);
            lenis.destroy();
        };
    }, []);

    return null;
}
