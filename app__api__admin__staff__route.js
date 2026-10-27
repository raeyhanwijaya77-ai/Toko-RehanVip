import { sql, init } from '@/lib/db';
import { getStaff } from '@/lib/auth';
import { normPhone } from '@/lib/phone';
const no = () => Response.json({ error: 'Hanya owner yang bisa mengelola admin' }, { status: 403 });
const bad = (m) => Response.json({ error: m }, { status: 400 });
export async function GET() {
  const me = await getStaff();
  if (!me?.owner) return no();
  await init();
  return Response.json(await sql`select id,username,email,role,phone from users where role in ('admin','admin_rehan') order by role desc,id`);
}
export async function POST(req) {
  const me = await getStaff();
  if (!me?.owner) return no();
  await init();
  const { login, phone } = await req.json();
  const id = String(login || '').toLowerCase().trim().replace(/\s+/g, '_');
  if (!id) return bad('Isi username atau Gmail pengguna');
  const [u] = id.includes('@') ? await sql`select id,role from users where email=${id}` : await sql`select id,role from users where lower(username)=${id}`;
  if (!u) return bad('Pengguna belum terdaftar. Minta dia mendaftar dulu di toko');
  if (u.role === 'admin_rehan') return bad('Itu akun owner');
  if (phone && String(phone).trim() && !normPhone(phone)) return bad('Nomor WhatsApp tidak valid');
  await sql`update users set role='admin',phone=coalesce(nullif(${normPhone(phone)}::text,''),phone) where id=${u.id}`;
  return Response.json({ ok: 1 });
}
export async function PATCH(req) {
  const me = await getStaff();
  if (!me?.owner) return no();
  await init();
  const { id, phone } = await req.json();
  if (phone && String(phone).trim() && !normPhone(phone)) return bad('Nomor WhatsApp tidak valid');
  await sql`update users set phone=${normPhone(phone)} where id=${id} and role in ('admin','admin_rehan')`;
  return Response.json({ ok: 1 });
}
export async function DELETE(req) {
  const me = await getStaff();
  if (!me?.owner) return no();
  await init();
  const id = new URL(req.url).searchParams.get('id');
  await sql`update users set role='user' where id=${id} and role='admin'`;
  return Response.json({ ok: 1 });
}
