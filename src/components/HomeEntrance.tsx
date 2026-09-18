'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { EntranceImages, EntranceSlide } from '@/lib/rooms';

// ============================================================
// 入口の設定（ここを1か所直せば全体に効く。CSS は変数だけを参照）
// ============================================================
export const ENTRANCE_CONFIG = {
    // 背景: 'slideshow'（サムネイル写真を順に切替） | 'video'
    media: 'slideshow' as 'slideshow' | 'video',
    videoSrc: '/home.mp4',      // media が 'video' のとき
    videoPoster: '/home.jpg',   // 動画読み込み前の静止画

    // 写真の収め方: 'cover'=画面を埋める（はみ出しは切り抜き） / 'contain'=収まる最大サイズ（余白は黒） / 'fill'=contain + 余白を同じ写真のぼかしで埋める
    fit: 'cover' as 'cover' | 'contain' | 'fill',
    backdropBlur: 24,           // fit='fill' の余白ぼかしの強さ px
    backdropDim: 0.5,           // fit='fill' の余白の明るさ（1=そのまま）

    // 画面の向きで写真を出し分ける: 縦持ち → 縦長写真、横向き → 横長写真
    matchOrientation: true,

    slideHoldMs: 3000,          // 1 枚の表示時間
    slideFadeMs: 1200,          // 切替のクロスフェード時間

    // 画像の上に重ねる柄: 'none' | 'lines'（走査線） | 'squares'（正方形） | 'mesh'（網目）
    pattern: 'lines' as 'none' | 'lines' | 'squares' | 'mesh',
    patternGap: 3,              // 間隔 px
    patternThickness: 1.5,      // 線の太さ / 正方形の一辺 px
    patternGray: 0,             // 柄の明るさ 0(黒)〜255(白)
    patternOpacity: 0.25,       // 柄の濃さ 0〜1
    patternBlend: 'overlay' as 'normal' | 'multiply' | 'screen' | 'overlay',

    darken: 0.1,                // 全体の暗さ（黒のベタ層）0〜1
    blur: 1,                    // 元画像のぼかし px
    colorShift: 1,              // 赤・青の左右ずれ px（0 で無効。動画では無効）
    grain: 0.08,                // 粒子の濃さ 0〜1（0 で無効）

    // 写真のキャプション（room*001 by 名前）をタイプライター表示
    caption: true,
    captionCharMs: 40,          // 1 文字あたりの表示間隔
    captionCursor: true,        // 末尾の点滅カーソル
    captionCursorHoldMs: 0,     // 打ち終わってからカーソルを消すまで（0 = 即座に消す）
    captionGapPx: 7,            // コピーライトとの間隔 px（コピーライト内の改行の間隔 .copyright__rights と同じ値にする）

    // 画面最上部のプログレスバー（1 枚の表示サイクルで左から右へ）
    progress: true,
    progressPx: 1,              // 太さ px
    progressOpacity: 0.7,       // 白の不透明度

    leaveMs: 800,               // ENTER 後に暗転して消えるまでの時間
    notice: '',                 // NEWS の文言（空なら表示しない）
};

const GRAIN_SVG = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

type Phase = 'shown' | 'leaving' | 'hidden';
type Orientation = 'portrait' | 'landscape';

interface HomeEntranceProps {
    images: EntranceImages; // ビルド時にシャッフル済み
}

function shuffled<T>(list: T[]): T[] {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function HomeEntrance({ images }: HomeEntranceProps) {
    const c = ENTRANCE_CONFIG;
    const pathname = usePathname();
    const router = useRouter();

    // / にいる間は入口を出す（HOME・ロゴで / に戻れば再び入口）
    const [phase, setPhase] = useState<Phase>(() => (pathname === '/' ? 'shown' : 'hidden'));

    // ---- 入口の表示制御 ----
    useEffect(() => {
        if (pathname === '/') {
            if (phase === 'hidden') setPhase('shown');
        } else if (phase === 'shown') {
            // 入口表示中にナビで別ページへ移動した
            setPhase('hidden');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // 入口表示中は body にクラス（ヘッダー透明・フッター非表示）。/rooms を先読み。
    useEffect(() => {
        const active = phase !== 'hidden';
        document.body.classList.toggle('is-gate', active);
        if (phase === 'shown') router.prefetch('/rooms');
        return () => {
            document.body.classList.remove('is-gate');
        };
    }, [phase, router]);

    // 暗転しながら遷移（ENTER は /rooms、キャプションはその写真へ）
    const leaveTo = (href: string) => {
        if (phase !== 'shown') return;
        setPhase('leaving');
        router.push(href);
        window.setTimeout(() => setPhase('hidden'), c.leaveMs);
    };
    const enter = () => leaveTo('/rooms');

    // ---- 画面の向き（マウント後に判定。サーバーでは null）----
    const [orientation, setOrientation] = useState<Orientation | null>(null);
    useEffect(() => {
        if (!c.matchOrientation) {
            setOrientation('landscape');
            return;
        }
        const mq = window.matchMedia('(orientation: portrait)');
        const apply = () => setOrientation(mq.matches ? 'portrait' : 'landscape');
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // キャプションをコピーライトの真上に置くため、フッターの高さを測る（スマホでは 2 行になる）
    const [footerH, setFooterH] = useState(58);
    useEffect(() => {
        if (phase === 'hidden') return;
        const footer = document.querySelector<HTMLElement>('.l-footer');
        if (!footer) return;
        const measure = () => {
            // スマホメニューを開いている間（body.is-fixed）はフッターが一時的に高くなるので測らない（キャプションが動かないように）
            if (document.body.classList.contains('is-fixed')) return;
            setFooterH(footer.getBoundingClientRect().height);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(footer);
        return () => ro.disconnect();
    }, [phase]);

    const poolOf = (o: Orientation) => (c.matchOrientation ? images[o] : images.landscape);

    // ---- スライドショー ----
    // 先頭はビルド時の順（HTML と一致）。2 枚目以降はマウント後にシャッフルし直す。
    const orderRef = useRef<EntranceSlide[]>([]);
    const posRef = useRef(0);
    const [slides, setSlides] = useState<{ a: EntranceSlide | null; b: EntranceSlide | null; active: 'a' | 'b' }>({ a: null, b: null, active: 'a' });
    const [slideSeq, setSlideSeq] = useState(0);

    useEffect(() => {
        if (phase !== 'shown' || c.media !== 'slideshow' || !orientation) return;
        const pool = poolOf(orientation);
        if (pool.length === 0) return;

        // 向きが決まった（または変わった）: 先頭を表示し、以降はシャッフル
        orderRef.current = [pool[0], ...shuffled(pool.slice(1))];
        posRef.current = 0;
        setSlides({ a: pool[0], b: null, active: 'a' });
        setSlideSeq((n) => n + 1);
        if (pool.length < 2) return;

        let cancelled = false;
        let timer = 0;
        const advance = () => {
            posRef.current = (posRef.current + 1) % orderRef.current.length;
            if (posRef.current === 0) {
                // 一周したら次の周も順を変える（直前の 1 枚が連続しないよう先頭に固定）
                const last = orderRef.current[orderRef.current.length - 1];
                orderRef.current = [last, ...shuffled(orderRef.current.slice(0, -1))];
                posRef.current = 1;
            }
            const next = orderRef.current[posRef.current];
            const img = new Image();
            img.onload = img.onerror = () => {
                if (cancelled) return;
                setSlides((s) => (s.active === 'a' ? { ...s, b: next, active: 'b' } : { ...s, a: next, active: 'a' }));
                setSlideSeq((n) => n + 1);
                timer = window.setTimeout(advance, c.slideHoldMs + c.slideFadeMs);
            };
            img.src = next.url;
        };
        timer = window.setTimeout(advance, c.slideHoldMs + c.slideFadeMs);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, orientation]);

    if (phase === 'hidden') return null;

    const useShift = c.media === 'slideshow' && c.colorShift > 0;
    const vars = {
        '--gate-fit': c.fit === 'cover' ? 'cover' : 'contain',
        '--gate-backdrop-blur': `${c.backdropBlur}px`,
        '--gate-backdrop-dim': String(c.backdropDim),
        '--gate-fade': `${c.slideFadeMs}ms`,
        '--gate-leave': `${c.leaveMs}ms`,
        '--gate-gap': `${c.patternGap}px`,
        '--gate-thick': `${c.patternThickness}px`,
        '--gate-rgb': `${c.patternGray}, ${c.patternGray}, ${c.patternGray}`,
        '--gate-ink': String(c.patternOpacity),
        '--gate-blend': c.patternBlend,
        '--gate-dark': String(c.darken),
        '--gate-blur': `${c.blur}px`,
        '--gate-shift': `${c.colorShift}px`,
        '--gate-grain': String(c.grain),
        '--gate-footer-h': `${footerH}px`,
        '--gate-cycle': `${c.slideHoldMs + c.slideFadeMs}ms`,
        '--gate-progress-px': `${c.progressPx}px`,
        '--gate-progress-opacity': String(c.progressOpacity),
        '--gate-caption-gap': `${c.captionGapPx}px`,
    } as CSSProperties;

    const renderImages = (src: string) => (
        <>
            {c.fit === 'fill' && <img className="entrance__backdrop" src={src} alt="" />}
            {useShift ? (
                <>
                    <img className="entrance__img entrance__img--g" src={src} alt="" />
                    <img className="entrance__img entrance__img--r" src={src} alt="" />
                    <img className="entrance__img entrance__img--b" src={src} alt="" />
                </>
            ) : (
                <img className="entrance__img" src={src} alt="" />
            )}
        </>
    );

    const renderSlide = (slide: EntranceSlide | null, key: 'a' | 'b', extraClass = '', active = slides.active === key) => (
        <div key={key} className={`entrance__slide ${extraClass} ${active ? 'is-active' : ''}`} aria-hidden="true">
            {slide && renderImages(slide.url)}
        </div>
    );

    // 表示中のスライド（キャプション用）。向きが決まる前は空
    const activeSlide = orientation === null ? null : (slides.active === 'a' ? slides.a : slides.b);
    const captionText = activeSlide ? `room*${activeSlide.roomNo}${activeSlide.roomBy ? ` by ${activeSlide.roomBy}` : ''}` : '';
    // キャプションのリンク先はその部屋の 1 枚目（表示中の写真ではなく部屋の先頭へ）
    const captionHref = activeSlide ? `/rooms/${activeSlide.roomNo}/01` : '/rooms';

    return (
        <div className={`entrance ${phase === 'leaving' ? 'is-leaving' : ''}`} style={vars}>
            {c.media === 'video' ? (
                <video className="entrance__img" autoPlay muted loop playsInline preload="auto" poster={c.videoPoster}>
                    <source src={c.videoSrc} type="video/mp4" />
                </video>
            ) : orientation === null ? (
                // 向きが分かる前（サーバー HTML・水和直後）: 縦・横の先頭を両方入れ、CSS の orientation で片方だけ見せる
                <>
                    {renderSlide(images.landscape[0] || null, 'a', 'entrance__slide--landscape', true)}
                    {renderSlide(images.portrait[0] || null, 'b', 'entrance__slide--portrait', true)}
                </>
            ) : (
                <>
                    {renderSlide(slides.a, 'a')}
                    {renderSlide(slides.b, 'b')}
                </>
            )}

            {c.progress && c.media === 'slideshow' && orientation !== null && (
                <div key={slideSeq} className="entrance__progress" aria-hidden="true" />
            )}

            <div className="entrance__dark" />
            {c.pattern !== 'none' && <div className={`entrance__pattern entrance__pattern--${c.pattern}`} />}
            {c.grain > 0 && <div className="entrance__grain" style={{ backgroundImage: GRAIN_SVG }} />}

            {c.caption && c.media === 'slideshow' && (
                <Typewriter text={captionText} href={captionHref} onNavigate={leaveTo} charMs={c.captionCharMs} cursor={c.captionCursor} cursorHoldMs={c.captionCursorHoldMs} />
            )}

            <div className="entrance__content">
                {c.notice && <p className="entrance__notice">{c.notice}</p>}
                <button type="button" className="entrance__enter" onClick={enter}>
                    ENTER
                </button>
            </div>

            {useShift && (
                <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                    <filter id="gate-only-r"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
                    <filter id="gate-only-g"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
                    <filter id="gate-only-b"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
                </svg>
            )}
        </div>
    );
}

// ---- タイプライター表示のキャプション ----
function Typewriter({ text, href, onNavigate, charMs, cursor, cursorHoldMs }: { text: string; href: string; onNavigate: (href: string) => void; charMs: number; cursor: boolean; cursorHoldMs: number }) {
    const [shown, setShown] = useState('');
    const [showCursor, setShowCursor] = useState(false);

    useEffect(() => {
        setShown('');
        if (!text) {
            setShowCursor(false);
            return;
        }
        setShowCursor(cursor);

        // タイマー（setInterval）はスマホで遅延してまとめて実行され「一気に出る」ことがあるため、
        // 描画フレームごとの経過時間で文字数を決める。1 フレームの経過は最大 100ms に抑え、
        // 画面が止まっていた分は数えない（復帰後も 1 文字ずつ続く）。
        let frame = 0;
        let hold = 0;
        let last = performance.now();
        let elapsed = 0;
        let shownCount = 0;
        const tick = (now: number) => {
            elapsed += Math.min(100, now - last);
            last = now;
            const count = Math.min(text.length, Math.floor(elapsed / charMs));
            if (count !== shownCount) {
                shownCount = count;
                setShown(text.slice(0, count));
            }
            if (count < text.length) {
                frame = requestAnimationFrame(tick);
            } else {
                hold = window.setTimeout(() => setShowCursor(false), cursorHoldMs);
            }
        };
        frame = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(hold);
        };
    }, [text, charMs, cursor, cursorHoldMs]);

    if (!text) return null;
    return (
        <p className="entrance__caption">
            <Link
                href={href}
                aria-label={text}
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate(href);
                }}
            >
                <span>{shown}</span>
                {showCursor && <span className="entrance__caption-cursor">_</span>}
            </Link>
        </p>
    );
}
