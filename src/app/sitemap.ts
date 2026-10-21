import { MetadataRoute } from 'next'

// output: 'export' ではメタデータルートも静的化を明示する
export const dynamic = 'force-static'

// メンテナンス中はトップのみ
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://www.roomandroom.org',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];
}
