// メンテナンス表示。トップ（page.tsx）と 404（not-found.tsx）の両方で使う
export default function MaintenanceNotice() {
  return (
    <div className="maintenance" role="status">
      <p className="maintenance__text">UNDER MAINTENANCE</p>
    </div>
  );
}
