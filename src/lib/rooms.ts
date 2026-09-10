// WordPress からのデータ取得を集約するモジュール。
// output: 'export' のビルド時に 1 回だけ取得し、全ページで共有する。

export interface RoomPhoto {
    id: number;
    title?: string;
    url: string;
    width?: number;
    height?: number;
    alt?: string;
}

export interface RoomPhotoItem {
    caption: string;
    room_photo: RoomPhoto | number;
    tags?: string;
}

export interface Room {
    id: number;
    slug: string;
    title: { rendered: string };
    acf: {
        room_no: string;
        room_by: string;
        photo_by: string;
        room_desc: string;
        sns_instagram: string;
        sns_x: string;
        photo_count: string;
        room_thumbnail: RoomPhoto | number;
        room_photos: RoomPhotoItem[];
        thumbnail_no: string;
    };
}

export interface Post {
    id: number;
    date: string;
    slug: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
}

export interface TaggedPhoto extends RoomPhotoItem {
    room_no: string;
    room_by: string;
    photo_by: string;
}

const WP_API = 'https://cms.roomandroom.org/w/wp-json/wp/v2';

const FETCH_OPTIONS: RequestInit = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    // ビルド中は Next のデータキャッシュに載せ、ワーカー間でも再取得しない
    cache: 'force-cache'
};

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, FETCH_OPTIONS);
    if (!res.ok) {
        // 取得失敗時は空サイトを書き出さないよう、ビルドを失敗させる
        throw new Error(`WP API error ${res.status}: ${url}`);
    }
    return res.json() as Promise<T>;
}

function roomNoOf(room: Room): number {
    return parseInt(room.acf?.room_no || '0', 10);
}

// 同一プロセス内では 1 回だけ取得する
let roomsPromise: Promise<Room[]> | null = null;

/** 全部屋を room_no 昇順で返す */
export function getAllRooms(): Promise<Room[]> {
    if (!roomsPromise) {
        roomsPromise = fetchJson<unknown>(`${WP_API}/rooms?acf_format=standard&per_page=100`)
            .then((data) => {
                if (!Array.isArray(data)) {
                    throw new Error('WP API returned non-array for rooms');
                }
                return (data as Room[]).sort((a, b) => roomNoOf(a) - roomNoOf(b));
            })
            .catch((err) => {
                roomsPromise = null;
                throw err;
            });
    }
    return roomsPromise;
}

/** 写真アイテムから URL を取り出す（ID のみの場合は空文字） */
export function photoUrlOf(item: RoomPhotoItem | undefined): string {
    if (!item) return '';
    const photo = item.room_photo;
    return (typeof photo === 'object' && photo?.url) || '';
}

/** タグ文字列を配列にする（区切りはカンマまたは空白） */
export function parseTags(tagString: string | undefined): string[] {
    return (tagString || '').split(/[,\s]+/).map((t) => t.trim()).filter((t) => t !== '');
}

/** タグ名 → 該当写真（部屋順・写真順）のマップ */
export function buildTagMap(rooms: Room[]): Map<string, TaggedPhoto[]> {
    const map = new Map<string, TaggedPhoto[]>();
    for (const room of rooms) {
        const photos = room.acf?.room_photos || [];
        for (const photo of photos) {
            for (const tagName of parseTags(photo.tags)) {
                const entry: TaggedPhoto = {
                    ...photo,
                    room_no: room.acf.room_no,
                    room_by: room.acf.room_by,
                    photo_by: room.acf.photo_by
                };
                const list = map.get(tagName);
                if (list) {
                    list.push(entry);
                } else {
                    map.set(tagName, [entry]);
                }
            }
        }
    }
    return map;
}

/** 指定タグの写真一覧 */
export async function getTaggedPhotos(tag: string): Promise<TaggedPhoto[]> {
    const rooms = await getAllRooms();
    return buildTagMap(rooms).get(tag) || [];
}

let postsPromise: Promise<Post[]> | null = null;

/** ブログ記事一覧 */
export function getPosts(): Promise<Post[]> {
    if (!postsPromise) {
        postsPromise = fetchJson<unknown>(`${WP_API}/posts?per_page=100`)
            .then((data) => {
                if (!Array.isArray(data)) {
                    throw new Error('WP API returned non-array for posts');
                }
                return data as Post[];
            })
            .catch((err) => {
                postsPromise = null;
                throw err;
            });
    }
    return postsPromise;
}

/** ブログ記事 1 件 */
export async function getPost(id: string): Promise<Post | null> {
    const posts = await getPosts();
    return posts.find((p) => String(p.id) === id) || null;
}

/** 2 桁ゼロ埋め */
export function padIndex(idx: number): string {
    return idx.toString().padStart(2, '0');
}
