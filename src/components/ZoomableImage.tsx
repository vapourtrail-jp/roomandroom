'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ZoomableImageProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // z=1 のとき、元の標準サイズ（480px）とする（= isSmall）
    // マウント前は常に false (デフォルトの拡大表示) とすることでサーバーと一致させる
    const isSmall = mounted && searchParams.get('z') === '1';

    const handleToggleZoom = () => {
        const nextSmall = !isSmall;
        const params = new URLSearchParams(searchParams.toString());
        if (nextSmall) {
            params.set('z', '1');
        } else {
            params.delete('z');
        }

        const query = params.toString();
        const url = query ? `${pathname}?${query}` : pathname;
        router.replace(url, { scroll: false });
    };

    const size = isSmall ? '480px' : '600px';

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} ${isSmall ? 'is-small' : 'is-large'}`}
            onClick={handleToggleZoom}
            style={{
                cursor: mounted ? (isSmall ? 'zoom-in' : 'zoom-out') : 'default',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                width: '100%',
                height: '100%',
                maxWidth: mounted ? size : '600px',
                maxHeight: mounted ? size : '600px',
                minHeight: 0, // Flex内で縮小可能にする
                transition: 'max-width 0.3s ease-in-out, max-height 0.3s ease-in-out'
            }}
        />
    );
}
