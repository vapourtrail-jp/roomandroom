import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) return {};

    return {
        title: post.title.rendered.replace(/<\/?[^>]+(>|$)/g, ""),
    };
}

interface Post {
    id: number;
    date: string;
    title: { rendered: string };
    content: { rendered: string };
}

async function getPost(id: string): Promise<Post | null> {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/posts/${id}`, {
            cache: 'force-cache'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        return null;
    }
}

export async function generateStaticParams() {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/posts?per_page=100`, {
            cache: 'force-cache'
        });
        if (!res.ok) return [];
        const posts = await res.json() as Post[];
        return posts.map(post => ({ id: post.id.toString() }));
    } catch (error) {
        return [];
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) notFound();

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
                <div className="blog-post__content content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
                <footer className="blog-post__footer">
                    <Link href="/blog" className="back-link">&lt; BACK TO BLOG</Link>
                </footer>
            </article>
        </div>
    );
}
