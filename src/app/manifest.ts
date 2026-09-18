import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

// スマホの「ホーム画面に追加」で使うアイコンと名前（Android Chrome はこのマニフェストのアイコンを使う）
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'room and room.',
        short_name: 'room and room.',
        start_url: '/',
        display: 'browser',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
    }
}
