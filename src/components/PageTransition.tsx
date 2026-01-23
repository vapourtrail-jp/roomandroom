"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // 部屋が切り替わる時（slugが異なる時）や、 rooms 一覧、about など他ページへの遷移時のみ
    // 全体のフェードを発生させるためのキーを生成。
    const transitionKey = useMemo(() => {
        const match = pathname.match(/^(\/rooms\/[^\/]+)\/\d+$/);
        return match ? match[1] : pathname;
    }, [pathname]);

    return (
        <div
            key={transitionKey}
            className="animate-fade-in"
            style={{ width: "100%" }}
        >
            {children}
        </div>
    );
}
