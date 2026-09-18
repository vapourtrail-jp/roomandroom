// 入口（画像スライドショー + NEWS + ENTER）はレイアウト側の HomeEntrance が描画する。
// ここは JS 無効時の導線だけを出す。
export default function Home() {
  return (
    <noscript>
      <a href="/rooms">ROOMS</a>
    </noscript>
  );
}
