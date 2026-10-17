import express from 'express';
import path from 'path';
import fs from 'fs';
import { apiRouter } from './server/api.ts';
import { db } from './server/db.ts';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers for API and preview environments
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Static assets (bundled images, media & uploads)
  const assetsDir = path.resolve(process.cwd(), 'src/assets');
  const publicDir = path.resolve(process.cwd(), 'public');
  app.use('/src/assets', express.static(assetsDir));
  app.use('/assets', express.static(assetsDir));
  app.use('/public', express.static(publicDir));
  app.use(express.static(publicDir));

  // Dedicated persistent media route (serves from disk, persistent DB media cache, or showroom fallback)
  app.get(['/uploads/:filename', '/src/assets/uploads/:filename'], async (req, res, _next) => {
    const filename = req.params.filename;
    const possiblePaths = [
      path.resolve(process.cwd(), 'public/uploads', filename),
      path.resolve(process.cwd(), 'src/assets/uploads', filename)
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return res.sendFile(p);
      }
    }

    const dataUrl = db.getMedia(filename);
    if (dataUrl && dataUrl.startsWith('data:image/')) {
      const match = dataUrl.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
      if (match) {
        const mime = `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}`;
        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        const buffer = Buffer.from(match[2], 'base64');
        try {
          const savePath = path.resolve(process.cwd(), 'public/uploads', filename);
          const saveDir = path.dirname(savePath);
          if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
          fs.writeFileSync(savePath, buffer);
        } catch (_) {}
        return res.send(buffer);
      }
    }

    // Smart graceful fallback if an un-migrated image name is requested
    const lower = filename.toLowerCase();
    let fallbackImage = 'hero_iphone_flagship_1790352890898.jpg';
    if (lower.includes('mac') || lower.includes('laptop')) {
      fallbackImage = 'showcase_macbook_pro_1790352903234.jpg';
    } else if (lower.includes('samsung') || lower.includes('galaxy') || lower.includes('s25')) {
      fallbackImage = 'category_samsung_galaxy_1790352913709.jpg';
    } else if (lower.includes('airpod') || lower.includes('accessories') || lower.includes('watch')) {
      fallbackImage = 'accessories_airpods_gadgets_1790352927938.jpg';
    }

    const fallbackPath = path.resolve(process.cwd(), 'src/assets/images', fallbackImage);
    if (fs.existsSync(fallbackPath)) {
      return res.sendFile(fallbackPath);
    }

    res.status(404).send('Image not found');
  });

  // API Router
  app.use('/api', apiRouter);

  // SEO: Dynamic Robots.txt
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://eragadgets.ng/sitemap.xml
`);
  });

  // SEO: Dynamic Sitemap.xml
  app.get('/sitemap.xml', (_req, res) => {
    const products = db.getProducts({ status: 'Published' });
    const baseUrl = 'https://eragadgets.ng';
    const now = new Date().toISOString();

    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/shop', priority: '0.9', changefreq: 'daily' },
      { path: '/iphone', priority: '0.8', changefreq: 'weekly' },
      { path: '/samsung', priority: '0.8', changefreq: 'weekly' },
      { path: '/mac', priority: '0.8', changefreq: 'weekly' },
      { path: '/deals', priority: '0.8', changefreq: 'daily' },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const route of staticRoutes) {
      xml += `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
    }

    for (const p of products) {
      xml += `  <url>
    <loc>${baseUrl}/products/${p.slug}</loc>
    <lastmod>${p.updatedAt || now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }

    xml += `</urlset>`;
    res.type('application/xml');
    res.send(xml);
  });

  if (!isProduction) {
    // Vite Dev Server middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Era Gadgets] Server listening on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Era Gadgets] Server startup error:', err);
  process.exit(1);
});
