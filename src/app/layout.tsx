import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./style.css";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import Navigation from "@/components/Navigation";
import BodyClassManager from "@/components/BodyClassManager";

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
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" />
      </head>
      <body className="home wp-singular page-template-default page page-id-8 wp-embed-responsive wp-theme-blankslate">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P4GJXTPS"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-P4GJXTPS');`}
        </Script>
        <BodyClassManager />
        <header className="header l-header l-padding">
          <Link href="/" className="logo">
            <img src="/logo_rar.png" height={29} alt="room and room" />
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
