import MaintenanceNotice from "@/components/MaintenanceNotice";

// メンテナンス中はトップ以外の URL をすべてトップへ戻す。
// 既知のパス（/rooms /tags /blog /about）は public/_redirects で 302、
// それ以外はこの 404 ページが即座にトップへ送る（JS 不要の meta refresh）。
export default function NotFound() {
  return (
    <>
      <meta httpEquiv="refresh" content="0;url=/" />
      <MaintenanceNotice />
    </>
  );
}
