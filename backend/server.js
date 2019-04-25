const http = require('http');
const crypto = require('crypto');

const port = process.env.PORT || 8080;

const svcId = process.env.SERVICE_ID || 'Unknown';

const escapeHtml = (unsafeHtml) =>
    unsafeHtml.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;')
        .replace(/{/g, '&#123;').replace(/}/g, '&#125;');

const server = http.createServer((req, res) => {
    const nonce = crypto.randomBytes(18).toString('base64');
    const headers = JSON.stringify(req.headers, undefined, 2);

    const body = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escapeHtml(svcId)}</title>
    <style nonce="${nonce}">
        body { font-family: sans-serif; font-size: 14px; }
    </style>
</head>
<body>
    <h3><code>${escapeHtml(req.method + ' ' + req.url)}</code></h3>
    <pre>${escapeHtml(headers)}</pre>
</body>
</html>`;

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-cache, no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'deny',
        'X-XSS-Protection': '1; mode=block',
        'Content-Security-Policy': `default-src 'self' 'nonce-${nonce}';`
    });

    res.end(body);
});

server.listen(port, (err) => {
    if (!err) {
        console.log(`Listening on port ${port}...`);
    }
});

process.on('SIGINT', () => {
    process.exit(130 /* 128 + SIGINT */);
});
