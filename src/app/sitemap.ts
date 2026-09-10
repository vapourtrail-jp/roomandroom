import { MetadataRoute } from 'next'
import { getAllRooms, getPosts } from '@/lib/rooms'

// output: 'export' ではメタデータルートも静的化を明示する
export const dynamic = 'force-static'

const BASE_URL = 'https://www.roomandroom.org'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const rooms = await getAllRooms();
    const posts = await getPosts();

    const roomPaths = rooms.map((room) => `/rooms/${room.acf.room_no}/01`);
    const blogPaths = posts.map((post) => `/blog/${post.id}`);

    const staticPaths = [
        '',
        '/rooms',
        '/about',
        '/blog',
        '/tags',
    ];

    const allPaths = [...staticPaths, ...roomPaths, ...blogPaths];

    return allPaths.map((path) => ({
        url: `${BASE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: path.startsWith('/blog/') || path.startsWith('/rooms/') ? 'monthly' : 'weekly',
        priority: path === '' ? 1.0 : 0.8,
    }));
}
