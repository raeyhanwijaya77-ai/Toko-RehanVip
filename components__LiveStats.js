'use client';
import { useEffect, useState } from 'react';
const Z = { online: 0, on_member: 0, visit: 0, visit_member: 0, sold: 0, stock: 0 };
function useLive() {
  const [d, setD] = useState(null);
  useEffect(() => {
    let on = true;
    const load = () => fetch('/api/live', { cache: 'no-store' }).then((r) => r.json()).then((x) => { if (on) setD(x); }).catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => { on = false; clearInterval(t); };
  }, []);
  return d || Z;
}
const n = (v) => Number(v || 0).toLocaleString('id-ID');
export function LiveStrip() {
  const d = useLive();
  return (
    <div className="strip">
      <span><i className="live" />On Member <b>{n(d.on_member)}</b></span>
      <span>Online <b>{n(d.online)}</b></span>
      <span>Pengunjung hari ini <b>{n(d.visit)}</b></span>
      <span>Stok <b>{n(d.stock)}</b></span>
      <span>Terjual <b>{n(d.sold)}</b></span>
    </div>
  );
}
export function LivePanel() {
  const d = useLive();
  const items = [['Visit Member', d.visit_member, 'member berkunjung hari ini'], ['On Member', d.on_member, 'member online sekarang'], ['Akun Terjual', d.sold, 'total pesanan lunas'], ['Total Stok Akun Sekarang', d.stock, 'stok dan lelang yang tersedia'], ['Pengunjung', d.visit, 'hari ini (semua pengunjung)'], ['User Aktif', d.online, 'online sekarang (semua)']];
  return (
    <div className="lv">
      {items.map(([t, v, s]) => (
        <div className="lvi" key={t}><small><i className="live" />{t}</small><b>{n(v)}</b><em>{s}</em></div>
      ))}
    </div>
  );
}
