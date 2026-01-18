'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function BodyClassManager() {
    const pathname = usePathname();

    useEffect(() => {
        const body = document.body;
        const classes = {
            home: 'p-home',
            about: 'p-about',
            rooms: 'p-rooms',
            room: 'p-room',
        };

        // 付与するクラスを判定
        let targetClass = '';
        if (pathname === '/') {
            targetClass = classes.home;
        } else if (pathname === '/about') {
            targetClass = classes.about;
        } else if (pathname === '/rooms') {
            targetClass = classes.rooms;
        } else if (pathname?.startsWith('/rooms/')) {
            targetClass = classes.room;
        }

        // 管理対象の p- クラスを一旦すべて削除
        Object.values(classes).forEach((cls) => {
            body.classList.remove(cls);
        });

        // 新しいクラスを追加
        if (targetClass) {
            body.classList.add(targetClass);
        }
    }, [pathname]);

    return null;
}
