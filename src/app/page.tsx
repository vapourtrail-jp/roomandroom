import Link from 'next/link';

export default function Home() {
  return (
    <Link href="/rooms" style={{ textDecoration: 'none' }}>
      <div className="home-notice">2026.1.18　room and room. is back!(This is a beta release. click here!)</div>
    </Link>
  );
}
