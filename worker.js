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

    return env.ASSETS.fetch(req);
  }
};
