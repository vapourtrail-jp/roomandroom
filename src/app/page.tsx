import Link from 'next/link';

export const runtime = 'edge';

export default function Home() {
  return (
    <div className="home-container">
      <div className="title">NEWS</div>
      <div className="content">
        <a href="/rooms" style={{ textDecoration: 'none' }}>
          <div className="home-notice">2026.1.18　room and room. is back!(This is a beta release. click here!)</div>
        </a>
      </div>
    </div>
  );
}
