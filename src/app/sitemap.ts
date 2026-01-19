import { MetadataRoute } from 'next'

interface Room {
    acf: {
        room_no: string;
    };
}

interface Post {
    id: number;
}

const BASE_URL = 'https://www.roomandroom.org'

async function getAllRoomPaths() {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/rooms?acf_format=standard&per_page=100`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const rooms: Room[] = await res.json();

        // 各部屋の最初の写真ページ (/01) をサイトマップに含める
        return rooms.map((room) => `/rooms/${room.acf.room_no}/01`);
    } catch (error) {
        console.error('Sitemap: Error fetching rooms:', error);
        return [];
    }
}

async function getAllBlogPaths() {
    try {
        const res = await fetch(`https://cms.roomandroom.org/w/wp-json/wp/v2/posts?per_page=100`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const posts: Post[] = await res.json();
        return posts.map((post) => `/blog/${post.id}`);
    } catch (error) {
        console.error('Sitemap: Error fetching posts:', error);
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const roomPaths = await getAllRoomPaths();
    const blogPaths = await getAllBlogPaths();

    const staticPaths = [
        '',
        '/rooms',
        '/about',
        '/blog',
    ];

    const allPaths = [...staticPaths, ...roomPaths, ...blogPaths];

    return allPaths.map((path) => ({
        url: `${BASE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: path.startsWith('/blog/') || path.startsWith('/rooms/') ? 'monthly' : 'weekly',
        priority: path === '' ? 1.0 : 0.8,
    }));
}
