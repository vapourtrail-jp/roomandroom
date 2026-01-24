export const runtime = 'edge';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'BLOG',
};


interface Post {
    id: number;
    date: string;
    title: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    slug: string;
}

async function getPosts(): Promise<Post[]> {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/posts`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: {
                tags: ['posts'],
                revalidate: 3600
            }
        });

        if (!res.ok) return [];

        const data = await res.json();
        if (!Array.isArray(data)) return [];

        return data;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

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
