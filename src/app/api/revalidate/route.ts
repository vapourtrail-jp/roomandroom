import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');

    // クエリパラメータの secret と環境変数の REVALIDATE_SECRET を比較
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 'rooms' タグのキャッシュを再検証
        revalidateTag('rooms', 'tag');
        // 各メインパスの再検証を追加
        revalidatePath('/rooms', 'layout');
        revalidatePath('/tags', 'layout');
        revalidatePath('/', 'layout');

        return NextResponse.json({
            revalidated: true,
            tag: 'rooms',
            now: Date.now()
        });
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
    }
}

// POSTリクエストでも同様に処理できるように追加（Webhook等で使用する場合）
export async function POST(request: NextRequest) {
    return GET(request);
}
