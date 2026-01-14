export const runtime = 'edge';

interface RoomPhoto {
    id: number;
    title: string;
    url: string;
    width: number;
    height: number;
    alt: string;
}

// ACFの「画像」フィールドが配列（Gallery）の場合の構造
interface RoomPhotoItem {
    caption: string;
    room_photo: RoomPhoto;
}

interface Room {
    id: number;
    title: {
        rendered: string;
    };
    acf: {
        room_no: string;
        room_thumbnail: RoomPhoto;
        room_photos: RoomPhotoItem[];
    };
}

async function getRooms(): Promise<Room[]> {
    try {
        const res = await fetch('https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard', {
            cache: 'force-cache',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { tags: ['rooms'] }
        });

        if (!res.ok) return [];

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
}

export default async function RoomsPage() {
    const rooms = await getRooms();

    return (
        <main style={{ padding: '20px' }}>
            <h1 className="title">ROOMS</h1>

            {rooms.length === 0 ? (
                <p>現在表示できるデータがありません。</p>
            ) : (
                rooms.map((room) => (
                    <div key={room.id} style={{ marginBottom: '40px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
                        <h2>
                            {room.title?.rendered}
                            {room.acf?.room_no && (
                                <span style={{ marginLeft: '10px', fontSize: '0.8em', color: '#666' }}>
                                    (No. {room.acf.room_no})
                                </span>
                            )}
                        </h2>

                        {/* サムネイルの表示 */}
                        {room.acf?.room_thumbnail?.url && (
                            <div style={{ marginTop: '20px' }}>
                                <img
                                    src={room.acf.room_thumbnail.url}
                                    alt={room.acf.room_thumbnail.alt || ''}
                                    style={{ maxWidth: '400px', height: 'auto', display: 'block', border: '1px solid #000' }}
                                />
                                <code style={{ fontSize: '12px' }}>{room.acf.room_thumbnail.url}</code>
                            </div>
                        )}
                    </div>
                ))
            )}
        </main>
    );
}
