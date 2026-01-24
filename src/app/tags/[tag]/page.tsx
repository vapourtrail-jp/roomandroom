
import { notFound, redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{
        tag: string;
    }>;
}

export default async function TagPageRedirect({ params }: PageProps) {
    const { tag } = await params;
    if (!tag) notFound();
    // 最初の写真へリダイレクト
    redirect(`/tags/${tag}/01`);
}
