"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navigation() {
    // Trigger build
    const [isOpen, setIsOpen] = useState(false);

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
                        <Link href="/blog" onClick={closeMenu}>BLOG</Link>
                    </li>
                    <li>
                        <Link href="/about" onClick={closeMenu}>ABOUT</Link>
                    </li>
                </ul>
            </nav>
        </>
    );
}
