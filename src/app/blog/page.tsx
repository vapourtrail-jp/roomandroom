import { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/lib/rooms';

export const metadata: Metadata = {
    title: 'BLOG',
};

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="blog-container">
            <h1 className="title">BLOG</h1>

            {posts.length === 0 ? (
                <p className="no-data">現在表示できる記事がありません。</p>
            ) : (
                <ul className="blog-list">
                    {posts.map((post) => (
                        <li key={post.id} className="blog-list__item">
                            <Link href={`/blog/${post.id}`} className="blog-card">
                                <time className="blog-card__date">
                                    {new Date(post.date).toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    }).replace(/\//g, '.')}
                                </time>
                                <h2 className="blog-card__title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
