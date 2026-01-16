"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useContext, useRef, ReactNode, useMemo } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

// コンテキストを固定するコンポーネント
// キーを渡すことで、同じ transitionKey 内でも中身を更新できるようにする
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

    // 写真の切り替え時 (/rooms/xxx/01 -> /rooms/xxx/02) は
    // 画面全体のフェードを止めるために共通のキーを生成する
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
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ width: "100%" }}
            >
                {/* 
                    同じ transitionKey 内での遷移（写真の変更）のときは 
                    FrozenRoute 自体を新しいキーで再生成させることで、
                    全体のフェードを発生させずに中身（01から02）だけを更新する。
                */}
                <FrozenRoute key={pathname}>{children}</FrozenRoute>
            </motion.div>
        </AnimatePresence>
    );
}
