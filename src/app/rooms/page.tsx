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
        room_photos: RoomPhotoItem[]; // 実態に合わせて修正
    };
}

async function getRooms(): Promise<{ data: Room[], status: number, error: string }> {
    try {
        const res = await fetch('https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard', {
            cache: 'no-store', // 一時的にキャッシュを無効化して接続テスト
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { tags: ['rooms'] }
        });

        if (!res.ok) {
            return { data: [], status: res.status, error: res.statusText };
        }

        const data = await res.json();
        return {
            data: Array.isArray(data) ? data : [],
            status: res.status,
            error: ''
        };
    } catch (error) {
        return { data: [], status: 0, error: String(error) };
    }
}

export default async function RoomsPage() {
    const { data: rooms, status, error } = await getRooms();

    return (
        <main style={{ padding: '20px' }}>
            <h1 className="title">ROOMS (Count: {rooms.length})</h1>
            {status !== 200 && (
                <div style={{ color: 'red', marginBottom: '20px' }}>
                    <p>Fetch Status: {status}</p>
                    <p>Error: {error}</p>
                </div>
            )}

            {rooms.length === 0 && status === 200 && (
                <p>APIは成功しましたが、データが空です。</p>
            )}

            {rooms.map((room) => (
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
                        <div style={{ marginBottom: '20px' }}>
                            <h3>Thumbnail</h3>
                            <img
                                src={room.acf.room_thumbnail.url}
                                alt={room.acf.room_thumbnail.alt || ''}
                                style={{ maxWidth: '300px', height: 'auto', display: 'block', border: '2px solid #000' }}
                            />
                            <code style={{ fontSize: '12px' }}>{room.acf.room_thumbnail.url}</code>
                        </div>
                    )}

                    {/* フォトギャラリーの表示 */}
                    <h3>Photos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {room.acf?.room_photos?.map((item, index) => {
                            const photo = item.room_photo;
                            if (!photo?.url) return null;

                            return (
                                <div key={photo.id || index}>
                                    <img
                                        src={photo.url}
                                        alt={photo.alt || ''}
                                        style={{ maxWidth: '400px', height: 'auto', display: 'block' }}
                                    />
                                    <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{photo.url}</code>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </main>
    );
}
