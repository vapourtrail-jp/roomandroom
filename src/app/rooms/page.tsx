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
        <div key={room.id} style={{ marginBottom: '40px' }}>
          <h2>{room.title.rendered}</h2>
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
