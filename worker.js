/* nderja.com — Worker: forza HTTPS e serve gli asset statici */

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // Forza HTTPS: se il visitatore è arrivato in HTTP, redirect 301 alla versione sicura.
    // Cloudflare espone lo schema originale del client nell'header CF-Visitor.
    let scheme = url.protocol.replace(':', '');
    try { scheme = JSON.parse(req.headers.get('CF-Visitor') || '{}').scheme || scheme; } catch (e) {}
    if (scheme === 'http') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    // Header di sicurezza su ogni risposta
    const res = await env.ASSETS.fetch(req);
    const out = new Response(res.body, res);
    out.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    out.headers.set('X-Content-Type-Options', 'nosniff');
    out.headers.set('X-Frame-Options', 'DENY');
    out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    out.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    return out;
  }
};
