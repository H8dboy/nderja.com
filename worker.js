/* nderja.com — Worker: serves static assets + map API (D1) */

const JSONH = { 'content-type': 'application/json' };
const ok = d => new Response(JSON.stringify(d), { headers: JSONH });
const bad = (m, s = 400) => new Response(JSON.stringify({ error: m }), { status: s, headers: JSONH });
const clean = (s, max) => String(s || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await api(req, env, url); }
      catch (e) { return bad('server error', 500); }
    }
    return env.ASSETS.fetch(req);
  }
};

async function api(req, env, url) {
  const db = env.DB;

  if (url.pathname === '/api/state' && req.method === 'GET') {
    const figures = (await db.prepare('SELECT id,name,photo FROM figures ORDER BY id').all()).results;
    const pins = (await db.prepare('SELECT id,lat,lng,city,figure_id FROM pins ORDER BY id DESC LIMIT 5000').all()).results;
    return ok({ figures, pins });
  }

  if (url.pathname === '/api/pins' && req.method === 'POST') {
    const b = await req.json().catch(() => null);
    if (!b) return bad('bad json');
    const lat = Number(b.lat), lng = Number(b.lng);
    const city = clean(b.city, 40);
    const fid = Number(b.figure_id);
    if (!isFinite(lat) || !isFinite(lng) || lat < 38 || lat > 44.5 || lng < 18 || lng > 23.5) return bad('out of bounds');
    if (!city) return bad('city required');
    const fig = await db.prepare('SELECT id FROM figures WHERE id=?').bind(fid).first();
    if (!fig) return bad('unknown figure');
    const r = await db.prepare('INSERT INTO pins(lat,lng,city,figure_id) VALUES(?,?,?,?)').bind(lat, lng, city, fid).run();
    return ok({ id: r.meta.last_row_id, lat, lng, city, figure_id: fid });
  }

  if (url.pathname === '/api/figures' && req.method === 'POST') {
    const b = await req.json().catch(() => null);
    if (!b) return bad('bad json');
    const name = clean(b.name, 40);
    if (!name) return bad('name required');
    const ex = await db.prepare('SELECT id,name,photo FROM figures WHERE name=? COLLATE NOCASE').bind(name).first();
    if (ex) return ok(ex);
    const cnt = (await db.prepare('SELECT COUNT(*) AS c FROM figures').first()).c;
    if (cnt >= 200) return bad('too many figures');
    const r = await db.prepare('INSERT INTO figures(name,photo) VALUES(?,NULL)').bind(name).run();
    return ok({ id: r.meta.last_row_id, name, photo: null });
  }

  return bad('not found', 404);
}
