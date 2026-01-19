import { MetadataRoute } from 'next'

export const runtime = 'edge';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/',
        },
        sitemap: 'https://www.roomandroom.org/sitemap.xml',
    }
}
