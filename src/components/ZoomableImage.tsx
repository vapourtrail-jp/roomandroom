'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface ZoomableImageProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const imgRef = useRef<HTMLImageElement>(null);

    const isZoomed = searchParams.get('z') === '1';
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!imgRef.current) return;

        // 初期表示かつズーム状態の場合、アニメーションなしで即座に適用
        if (isFirstRender.current) {
            isFirstRender.current = false;
            if (isZoomed) {
                gsap.set(imgRef.current, {
                    maxWidth: '600px',
                    maxHeight: '600px',
                    width: '600px',
                    height: '600px'
                });
            } else {
                gsap.set(imgRef.current, {
                    maxWidth: '480px',
                    maxHeight: '480px',
                    width: '100%',
                    height: 'auto'
                });
            }
            return;
        }

        // 2回目以降（クリック時）はアニメーションを適用
        if (isZoomed) {
            gsap.to(imgRef.current, {
                maxWidth: '600px',
                maxHeight: '600px',
                width: '600px',
                height: '600px',
                duration: 0.6,
                ease: 'power2.inOut',
                overwrite: true
            });
        } else {
            gsap.to(imgRef.current, {
                maxWidth: '480px',
                maxHeight: '480px',
                width: '100%',
                height: 'auto',
                duration: 0.6,
                ease: 'power2.inOut',
                overwrite: true
            });
        }
    }, [isZoomed]);

    const handleToggleZoom = () => {
        const nextZoom = !isZoomed;
        const params = new URLSearchParams(searchParams.toString());
        if (nextZoom) {
            params.set('z', '1');
        } else {
            params.delete('z');
        }

        const query = params.toString();
        const url = query ? `${pathname}?${query}` : pathname;
        router.replace(url, { scroll: false });
    };

    return (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`${className} ${isZoomed ? 'is-zoomed' : ''}`}
            onClick={handleToggleZoom}
            style={{
                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto'
            }}
        />
    );
}
