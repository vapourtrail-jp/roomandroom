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

/** 一覧カード用の最小データ */
export interface RoomListItem {
    id: number;
    roomNo: string;
    roomBy: string;
    thumbnailUrl: string;
}

/** Room[] → 一覧カード用データ（サムネイルは thumbnail_no → room_thumbnail → 1 枚目 の順で決める） */
export function toRoomListItems(rooms: Room[]): RoomListItem[] {
    return rooms.map((room) => ({
        id: room.id,
        roomNo: room.acf?.room_no || '',
        roomBy: room.acf?.room_by || '',
        thumbnailUrl: thumbnailUrlOf(room),
    }));
}

/** 部屋のサムネイル画像 URL（thumbnail_no → room_thumbnail → 1 枚目）。一覧と入口で共用 */
export function thumbnailUrlOf(room: Room): string {
    const thumbIdx = parseInt(room.acf?.thumbnail_no || '0', 10) - 1;
    const photos = Array.isArray(room.acf?.room_photos) ? room.acf.room_photos : [];
    return (thumbIdx >= 0 && photoUrlOf(photos[thumbIdx]))
        || (typeof room.acf?.room_thumbnail === 'object' && room.acf.room_thumbnail?.url)
        || photoUrlOf(photos[0])
        || '';
}

/** 部屋のサムネイル写真オブジェクト（URL と縦横サイズ）。thumbnail_no → room_thumbnail → 1 枚目 */
export function thumbnailPhotoOf(room: Room): RoomPhoto | null {
    const thumbIdx = parseInt(room.acf?.thumbnail_no || '0', 10) - 1;
    const photos = Array.isArray(room.acf?.room_photos) ? room.acf.room_photos : [];
    const pick = (item: RoomPhotoItem | undefined) => (item && typeof item.room_photo === 'object' && item.room_photo?.url ? item.room_photo : null);
    return (thumbIdx >= 0 && pick(photos[thumbIdx]))
        || (typeof room.acf?.room_thumbnail === 'object' && room.acf.room_thumbnail?.url ? room.acf.room_thumbnail : null)
        || pick(photos[0]);
}

export interface EntranceSlide {
    url: string;
    roomNo: string;
    roomBy: string;
    photoIndex: string; // その写真の枚目（2 桁）。リンク先 /rooms/{roomNo}/{photoIndex}
}

export interface EntranceImages {
    portrait: EntranceSlide[];  // 縦長（スマホ縦持ち向け）
    landscape: EntranceSlide[]; // 横長（PC・横向き向け）
}

function shuffleInPlace<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** 入口のスライドショー用: 全部屋のサムネイル写真を縦長・横長に分け、ビルド時にシャッフルして返す。正方形は両方に入れる */
export async function getEntranceImages(): Promise<EntranceImages> {
    const rooms = await getAllRooms();
    const portrait: EntranceSlide[] = [];
    const landscape: EntranceSlide[] = [];
    for (const room of rooms) {
        const p = thumbnailPhotoOf(room);
        if (!p) continue;
        const w = p.width || 0;
        const h = p.height || 0;
        // 何枚目の写真かを探す（room_photos に無ければ 1 枚目へ）
        const photos = Array.isArray(room.acf?.room_photos) ? room.acf.room_photos : [];
        const found = photos.findIndex((item) => photoUrlOf(item) === p.url);
        const slide: EntranceSlide = {
            url: p.url,
            roomNo: room.acf?.room_no || '',
            roomBy: room.acf?.room_by || '',
            photoIndex: padIndex(found >= 0 ? found + 1 : 1),
        };
        if (h >= w) portrait.push(slide);
        if (w >= h) landscape.push(slide);
    }
    // 片方が空なら、もう片方で代用する
    if (portrait.length === 0) portrait.push(...landscape);
    if (landscape.length === 0) landscape.push(...portrait);
    return { portrait: shuffleInPlace(portrait), landscape: shuffleInPlace(landscape) };
}
