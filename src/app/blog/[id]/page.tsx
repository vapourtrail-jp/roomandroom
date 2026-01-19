import { notFound } from 'next/navigation';
import Link from 'next/link';

export const runtime = 'edge';

interface Post {
    id: number;
    date: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
}

async function getPost(id: string): Promise<Post | null> {
    const timestamp = Date.now();
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/posts/${id}?_=${timestamp}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: {
                revalidate: 0
            }
        });

        if (!res.ok) return null;

        return await res.json();
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    return (
        <div className="blog-detail-container">
            <article className="blog-post">
                <header className="blog-post__header">
                    <time className="blog-post__date">
                        {new Date(post.date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }).replace(/\//g, '.')}
                    </time>
                    <h1 className="blog-post__title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                </header>

                <div
                    className="blog-post__content content"
                    dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                />

                <footer className="blog-post__footer">
                    <Link href="/blog" className="back-link">
                        &lt; BACK TO BLOG
                    </Link>
                </footer>
            </article>
        </div>
    );
}
