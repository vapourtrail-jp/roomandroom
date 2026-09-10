'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * 静的書き出しでも使えるクエリ取得フック。
 * next/navigation の useSearchParams は静的ページで CSR フォールバックを強制し
 * 初期 HTML から要素が消えるため、マウント後に window.location から読む。
 * 初期値は空（サーバー HTML と一致させる）。パス変更・戻る進むで再読込する。
 */
export function useClientSearchParams(): URLSearchParams {
    const pathname = usePathname();
    const [params, setParams] = useState<URLSearchParams>(() => new URLSearchParams());

    useEffect(() => {
        const read = () => setParams(new URLSearchParams(window.location.search));
        read();
        window.addEventListener('popstate', read);
        return () => window.removeEventListener('popstate', read);
    }, [pathname]);

    return params;
}
