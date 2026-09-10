import { notFound } from 'next/navigation';
import TagPhotoFooter from '@/components/TagPhotoFooter';
import { getTaggedPhotos } from '@/lib/rooms';

export default async function TagLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ tag: string }>;
}) {
    const { tag } = await params;
    // URLエンコードされたタグ名をデコード
    const decodedTag = typeof tag === 'string' ? decodeURIComponent(tag) : '';
    const taggedPhotos = await getTaggedPhotos(decodedTag);

    if (taggedPhotos.length === 0) {
        notFound();
    }

    const photoMetadata = taggedPhotos.map(p => ({
        roomBy: p.room_by,
        photoBy: p.photo_by,
        roomNo: p.room_no
    }));

    return (
        <div className="room-photo-page">
            {children}

            <TagPhotoFooter
                tag={tag}
                totalPhotos={taggedPhotos.length}
                photoMetadata={photoMetadata}
            />
        </div>
    );
}
