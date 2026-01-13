import type { Metadata } from "next";
import "./globals.css";
import "./style.css";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import Navigation from "@/components/Navigation";

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
        <header className="header l-header l-padding">
          <Link href="/">
            <img src="/logo_rar.png" height={33} alt="room and room" />
          </Link>
        </header>

        <Navigation />

        <main id="content" className="main l-main l-padding">
          <PageTransition>{children}</PageTransition>
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
                <img src="/sns-x-bk.png" alt="X" />
              </a>
              <a
                href="https://www.instagram.com/roomandroom/"
                target="_blank"
                rel="noopener noreferrer"
                className="sns-icon sns-instagram"
              >
                <img src="/sns-instagram-black.png" alt="Instagram" />
              </a>
              <a
                href="https://www.threads.net/@roomandroom"
                target="_blank"
                rel="noopener noreferrer"
                className="sns-icon sns-threads"
              >
                <img src="/sns-threads-bk.png" alt="Threads" />
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
