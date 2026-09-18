"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navigation() {
    // JS 初期化前に（layout.tsx の小さなスクリプトで）開かれていた場合は、その状態を引き継ぐ
    const [isOpen, setIsOpen] = useState(() =>
        typeof document !== 'undefined' && !!document.getElementById('g-nav')?.classList.contains('is-open')
    );

    // 初期化が済んだら、初期化前用のクリック処理を無効にする（二重に切り替わらないように）
    useEffect(() => {
        const btn = document.querySelector<HTMLElement>('.mob-menu');
        if (btn) btn.dataset.hydrated = '1';
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("is-fixed");
        } else {
            document.body.classList.remove("is-fixed");
        }

        // Cleanup function when component unmounts
        return () => {
            document.body.classList.remove("is-fixed");
        };
    }, [isOpen]);

    // Close menu when a link is clicked
    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            <div
                className={`mob-menu js-toggle-menu ${isOpen ? "panelactive" : ""}`}
                onClick={toggleMenu}
            >
                <div className={`menu-icon ${isOpen ? "is-open" : ""}`}>
                    <span></span>
                    <span></span>
                </div>
            </div>

            <nav
                id="g-nav"
                className={`header-nav js-nav ${isOpen ? "panelactive is-open" : ""}`}
            >
                <ul className="menu-main">
                    <li>
                        <Link href="/" onClick={closeMenu}>HOME</Link>
                    </li>
                    <li>
                        <Link href="/rooms" onClick={closeMenu}>ROOMS</Link>
                    </li>
                    <li>
                        <Link href="/tags" onClick={closeMenu}>TAGS</Link>
                    </li>
                    <li>
                        <Link href="/about" onClick={closeMenu}>ABOUT</Link>
                    </li>
                </ul>
            </nav>
        </>
    );
}
