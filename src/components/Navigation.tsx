"use client";

import { useState, useEffect } from "react";

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
                        <a href="/" onClick={closeMenu}>HOME</a>
                    </li>
                    <li>
                        <a href="/rooms" onClick={closeMenu}>ROOMS</a>
                    </li>
                    <li>
                        <a href="/tags" onClick={closeMenu}>TAGS</a>
                    </li>
                    <li>
                        <a href="/about" onClick={closeMenu}>ABOUT</a>
                    </li>
                </ul>
            </nav>
        </>
    );
}
