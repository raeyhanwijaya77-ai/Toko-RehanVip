import { redirect } from 'next/navigation';
import { sql, init } from '@/lib/db';
import { getUser, ADMIN } from '@/lib/auth';
import Reveal from '@/components/Reveal';
import PwOtp from '@/components/PwOtp';
import ProfileForm from '@/components/ProfileForm';
export const dynamic = 'force-dynamic';
export default async function Profil() {
  const u = await getUser();
  if (!u) redirect('/login');
  await init();
  const [r] = await sql`select username,email,avatar,role from users where id=${u.id}`;
  if (!r) redirect('/login');
  const [c] = await sql`select count(*)::int as n from orders where user_id=${u.id} and status='paid'`;
  const owner = r.role === 'admin_rehan' || r.email === ADMIN;
  const title = owner ? 'Sang Penguasa' : r.role === 'admin' ? 'Admin' : 'Pembeli';
  return (
    <div className="w">
      <Reveal>
        <div className="box" style={{ maxWidth: 520 }}>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <span className={'pill ' + (owner ? 'gold' : r.role === 'admin' ? 'info' : 'mut')}>{owner ? '♛ ' : ''}{title}</span>
            <p className="mut" style={{ marginTop: 6 }}>{r.email} · {c?.n || 0} akun dibeli</p>
          </div>
          <ProfileForm username={r.username || ''} avatar={r.avatar || ''} />
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="box" style={{ maxWidth: 520, marginTop: 0 }}>
          <h3 style={{ marginBottom: 10 }}>Ganti password</h3>
          <PwOtp email={r.email} />
        </div>
      </Reveal>
    </div>
  );
}
