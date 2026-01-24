import { notFound, redirect } from 'next/navigation';

export const runtime = 'edge';

interface PageProps {
    params: Promise<{
        tag: string;
    }>;
}

export default async function TagPageRedirect({ params }: PageProps) {
    const { tag } = await params;
    if (!tag) notFound();
    redirect(`/tags/${tag}/01`);
}
