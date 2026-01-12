import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "room and room.",
  description: "room and room.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="home wp-singular page-template-default page page-id-8 wp-embed-responsive wp-theme-blankslate">
        <a href="#content" className="skip-link screen-reader-text">
          Skip to the content
        </a>
        <header className="header l-header l-padding">
          <a href="https://www.roomandroom.org/">
            <img src="/img/logo_rar.png" height={33} alt="room and room" />
          </a>
        </header>

        <div className="mob-menu">
          <span></span>
          <span></span>
        </div>
        <nav id="g-nav" className="header-nav">
          <ul className="menu-main">
            <li>
              <Link href="/">HOME</Link>
            </li>
            <li>
              <Link href="/trip">ROOMS</Link>
            </li>
            <li>
              <Link href="/about">ABOUT</Link>
            </li>
          </ul>
        </nav>

        <main id="content" className="main l-main l-padding">
          {children}
        </main>

        <footer className="footer l-footer l-padding">
          <div className="menu-footer">
            <div className="list-sns">
              <a
                href="https://x.com/roomandroom"
                target="_blank"
                rel="noopener noreferrer"
                className="sns-icon sns-x"
              >
                <img src="/img/sns/sns-x-bk.png" alt="X" />
              </a>
              <a
                href="https://www.instagram.com/roomandroom/"
                target="_blank"
                rel="noopener noreferrer"
                className="sns-icon sns-instagram"
              >
                <img src="/img/sns/sns-instagram-black.png" alt="Instagram" />
              </a>
              <a
                href="https://www.threads.net/@roomandroom"
                target="_blank"
                rel="noopener noreferrer"
                className="sns-icon sns-threads"
              >
                <img src="/img/sns/sns-threads-bk.png" alt="Threads" />
              </a>
            </div>
          </div>
          <div className="copyright">
            Copyright &copy; 2026 room and room. All right reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
