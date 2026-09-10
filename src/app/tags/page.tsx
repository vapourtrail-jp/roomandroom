import { Metadata } from 'next';
import Link from 'next/link';
import WobblyThumbnail from '@/components/WobblyThumbnail';
import { buildTagMap, getAllRooms, photoUrlOf } from '@/lib/rooms';

export const metadata: Metadata = {
    title: 'TAGS',
};

export default async function TagsPage() {
    const allRooms = await getAllRooms();
    const tagMap = buildTagMap(allRooms);

    const sortedTags = Array.from(tagMap.entries())
        .map(([name, photos]) => ({
            name,
            count: photos.length,
            // 最初にそのタグが付いた写真をサムネイルに使う
            thumbnailUrl: photoUrlOf(photos.find((p) => photoUrlOf(p) !== '')),
        }))
        .filter(tag => tag.count > 1 && tag.thumbnailUrl !== '')
        .sort((a, b) => a.name.localeCompare(b.name, 'ja'));

    return (
        <div className="rooms-container">
            <div className="rooms-header">
                <h1 className="title">TAGS</h1>
            </div>

            {sortedTags.length === 0 ? (
                <p className="no-data">現在表示できる銘柄（タグ）がありません。</p>
            ) : (
                <ul className="l-list">
                    {sortedTags.map((tag, index) => (
                        <li
                            key={tag.name}
                            className="l-list__item room-card-wrapper"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <Link href={`/tags/${encodeURIComponent(tag.name)}/01`} className="room-card">
                                <div className="room-card__thumbnail">
                                    <WobblyThumbnail
                                        src={tag.thumbnailUrl}
                                        alt={tag.name}
                                        uid={`tag-${tag.name}`}
                                        initialDelay={index * 0.1}
                                    />
                                </div>

                                <div className="room-card__body">
                                    <p className="room-card__no">
                                        {tag.name} <span style={{ fontWeight: 'normal' }}>({tag.count})</span>
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
