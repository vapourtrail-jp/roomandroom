import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getPosts } from '@/lib/rooms';

export const dynamicParams = false;

export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map((post) => ({ id: String(post.id) }));
}

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
