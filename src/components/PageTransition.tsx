"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useContext, useRef, ReactNode, useMemo } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

// コンテキストを固定するコンポーネント
function FrozenRoute({ children }: { children: ReactNode }) {
    const context = useContext(LayoutRouterContext);
    const frozen = useRef(context).current;

    return (
        <LayoutRouterContext.Provider value={frozen}>
            {children}
        </LayoutRouterContext.Provider>
    );
}

export default function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // 部屋が切り替わる時（slugが異なる時）や、 rooms 一覧、about など他ページへの遷移時のみ
    // 全体のフェードを発生させるためのキーを生成。
    // 例: /rooms/001/01 と /rooms/001/02 は同じキーになるため、全体フェードは起きない。
    const transitionKey = useMemo(() => {
        const match = pathname.match(/^(\/rooms\/[^\/]+)\/\d+$/);
        return match ? match[1] : pathname;
    }, [pathname]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={transitionKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ width: "100%" }}
            >
                {/* 
                  部屋が変わらない（transitionKeyが同じ）場合は、
                  FrozenRoute を解除して中身だけを即座に更新する。
                  これにより、footerなどは維持されたまま、children内（LocalPhotoContainer）で
                  個別のフェードが発生するようになる。
                */}
                <FrozenRoute key={pathname}>{children}</FrozenRoute>
            </motion.div>
        </AnimatePresence>
    );
}
