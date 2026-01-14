interface RoomPhoto {
    id: number;
    title: string;
    url: string;
    width: number;
    height: number;
    alt: string;
}

interface Room {
    id: number;
    title: {
        rendered: string;
    };
    acf: {
        room_no: string;
        room_thumbnail: RoomPhoto;
        room_photos: RoomPhoto[];
    };
}

async function getRooms(): Promise<Room[]> {
    const res = await fetch('https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard', {
        next: { tags: ['rooms'] },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch rooms');
    }

    return res.json();
}

export default async function RoomsPage() {
    const rooms = await getRooms();

    return (
        <main style={{ padding: '20px' }}>
            <h1 className="title">ROOMS</h1>
            {rooms.map((room) => (
                <div key={room.id} style={{ marginBottom: '40px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
                    <h2>
                        {room.title.rendered}
                        {room.acf?.room_no && (
                            <span style={{ marginLeft: '10px', fontSize: '0.8em', color: '#666' }}>
                                (No. {room.acf.room_no})
                            </span>
                        )}
                    </h2>

                    {/* サムネイルの表示 */}
                    {room.acf?.room_thumbnail && (
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
                        {room.acf?.room_photos?.map((photo, index) => (
                            <div key={photo.id || index}>
                                <img
                                    src={photo.url}
                                    alt={photo.alt || ''}
                                    style={{ maxWidth: '400px', height: 'auto', display: 'block' }}
                                />
                                <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{photo.url}</code>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </main>
    );
}
