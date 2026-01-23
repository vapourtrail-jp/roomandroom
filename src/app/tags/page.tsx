import { Metadata } from 'next';
import Link from 'next/link';
import WobblyThumbnail from '@/components/WobblyThumbnail';

export const runtime = 'edge';

export const metadata: Metadata = {
    title: 'TAGS',
};

interface RoomPhoto {
    id: number;
    url: string;
}

interface RoomPhotoItem {
    caption: string;
    room_photo: RoomPhoto;
    tags?: string;
}

interface Room {
    id: number;
    acf: {
        room_no: string;
        room_photos: RoomPhotoItem[];
    };
}

async function getAllRooms(): Promise<Room[]> {
    const timestamp = Date.now();
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&per_page=100&_=${timestamp}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: {
                tags: ['rooms'],
                revalidate: 3600 // ISR
            }
        });

        if (!res.ok) return [];
        const data = await res.json();
        if (!Array.isArray(data)) return [];

        return data.sort((a, b) => {
            const noA = parseInt(a.acf?.room_no || '0', 10);
            const noB = parseInt(b.acf?.room_no || '0', 10);
            return noA - noB;
        });
    } catch (error) {
        console.error('Error fetching rooms for tag list:', error);
        return [];
    }
}

export default async function TagsPage() {
    const allRooms = await getAllRooms();

    // タグとそのサムネイル（最初の1枚）および件数を抽出
    const tagMap = new Map<string, { thumbnailUrl: string; count: number }>();

    allRooms.forEach(room => {
        const photos = room.acf.room_photos || [];
        photos.forEach(photo => {
            const tagString = photo.tags || '';
            const tagsArray = tagString.split(/[,\s]+/).map(t => t.trim()).filter(t => t !== '');

            tagsArray.forEach(tagName => {
                const existing = tagMap.get(tagName);
                if (existing) {
                    existing.count += 1;
                } else {
                    if (typeof photo.room_photo === 'object' && photo.room_photo?.url) {
                        tagMap.set(tagName, { thumbnailUrl: photo.room_photo.url, count: 1 });
                    }
                }
            });
        });
    });

    const sortedTags = Array.from(tagMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .filter(tag => tag.count > 1)
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
