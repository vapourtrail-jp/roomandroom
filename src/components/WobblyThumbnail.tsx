'use client';

import { useState, useEffect, useRef } from 'react';
import anime from 'animejs';

interface WobblyThumbnailProps {
    src: string;
    alt: string;
    initialDelay?: number;
}

export default function WobblyThumbnail({ src, alt, initialDelay = 0 }: WobblyThumbnailProps) {
    const pathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // Hydrationエラー（使用するIDのズレ）を避けるため、マウント後に生成される乱数を使用
    const [uniqueId, setUniqueId] = useState<string>('');

    const state = useRef({
        progress: 0,
        wobbleScale: 1.1,
        time: Math.random() * 100
    });

    useEffect(() => {
        // マウント時にIDを一意に確定（サーバーとクライアントの不一致を防ぎ、リンクが死ぬのを防ぐ）
        setUniqueId(Math.random().toString(36).substring(2, 9));
    }, []);

    useEffect(() => {
        if (!pathRef.current || !containerRef.current || !uniqueId) return;

        const card = containerRef.current.closest('.room-card');
        const CONFIG = {
            baseRadius: 46,
            wobbleAmount: 3.5,
            wobbleSpeed: 3.5,
            numPoints: 8
        };

        const points = Array.from({ length: CONFIG.numPoints }, (_, i) => ({
            angle: (i / CONFIG.numPoints) * Math.PI * 2,
            phase: Math.random() * Math.PI * 2,
            indivSpeed: 0.8 + Math.random() * 1.5
        }));

        const squareTargets = [
            { x: 100, y: 50 }, { x: 100, y: 100 }, { x: 50, y: 100 }, { x: 0, y: 100 },
            { x: 0, y: 50 }, { x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }
        ];

        let animationFrameId: number;

        const update = () => {
            const s = state.current;
            s.time += 0.016;
            const t = s.time;
            const currentPoints = points.map((p, i) => {
                const wave = (Math.sin(t * CONFIG.wobbleSpeed * p.indivSpeed + p.phase) * CONFIG.wobbleAmount) * s.wobbleScale;
                const r = CONFIG.baseRadius + wave;
                const bx = 50 + Math.cos(p.angle) * r;
                const by = 50 + Math.sin(p.angle) * r;
                const tx = squareTargets[i].x;
                const ty = squareTargets[i].y;
                return {
                    x: bx + (tx - bx) * s.progress,
                    y: by + (ty - by) * s.progress
                };
            });

            const tension = 0.23 * (1 - s.progress);
            let d = `M ${currentPoints[0].x},${currentPoints[0].y}`;
            for (let i = 0; i < CONFIG.numPoints; i++) {
                const i1 = (i + 1) % CONFIG.numPoints;
                const p0 = currentPoints[i];
                const p1 = currentPoints[i1];
                if (s.progress >= 0.99) {
                    d += ` L ${p1.x},${p1.y}`;
                } else {
                    const iPrev = (i - 1 + CONFIG.numPoints) % CONFIG.numPoints;
                    const iNext = (i + 2) % CONFIG.numPoints;
                    const prev = currentPoints[iPrev];
                    const next = currentPoints[iNext];
                    const cp1x = p0.x + (p1.x - prev.x) * tension;
                    const cp1y = p0.y + (p1.y - prev.y) * tension;
                    const cp2x = p1.x - (next.x - p0.x) * tension;
                    const cp2y = p1.y - (next.y - p0.y) * tension;
                    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
                }
            }
            d += " Z";

            if (pathRef.current) {
                pathRef.current.setAttribute('d', d);
                pathRef.current.setAttribute('transform', 'scale(0.01)');
            }
            animationFrameId = requestAnimationFrame(update);
        };

        const handleMouseEnter = () => {
            anime.remove(state.current);
            anime({
                targets: state.current,
                progress: 0,
                wobbleScale: 1.2,
                duration: 600,
                easing: 'easeOutQuad'
            });
        };

        const handleMouseLeave = () => {
            anime.remove(state.current);
            anime({
                targets: state.current,
                progress: 1,
                wobbleScale: 0,
                duration: 800,
                easing: 'easeOutExpo'
            });
        };

        animationFrameId = requestAnimationFrame(update);
        const isMouse = window.matchMedia('(pointer: fine)').matches;
        if (isMouse && card) {
            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);
        }

        anime({
            targets: state.current,
            progress: 1,
            wobbleScale: 0,
            duration: 800,
            delay: initialDelay * 1000 + 800,
            easing: 'easeOutExpo'
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
            anime.remove(state.current);
            if (card) {
                card.removeEventListener('mouseenter', handleMouseEnter);
                card.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [initialDelay, uniqueId]);

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', width: '80px', height: '80px', background: 'transparent' }}
        >
            {uniqueId && (
                <>
                    <svg width="0" height="0" style={{ position: 'absolute' }}>
                        <defs>
                            <clipPath id={`wobble-${uniqueId}`} clipPathUnits="objectBoundingBox">
                                <path ref={pathRef} />
                            </clipPath>
                        </defs>
                    </svg>
                    <img
                        src={src}
                        alt={alt}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            clipPath: `url(#wobble-${uniqueId})`,
                            WebkitClipPath: `url(#wobble-${uniqueId})`,
                            display: 'block'
                        }}
                    />
                </>
            )}
        </div>
    );
}
