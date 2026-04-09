import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL } from '@/constants/site'

const STATIC_ROUTES = ['', '/about', '/blog', '/projects', '/contact', '/uses']

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const urls = STATIC_ROUTES.flatMap((path) => {
          const enLoc = `${SITE_URL}${path}`
          const bgLoc = `${SITE_URL}/bg${path}`
          const changefreq = path === '' ? 'weekly' : 'monthly'
          const priority = path === '' ? '1.0' : '0.8'
          return [
            `
  <url>
    <loc>${enLoc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}"/>
    <xhtml:link rel="alternate" hreflang="bg" href="${bgLoc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enLoc}"/>
  </url>`,
            `
  <url>
    <loc>${bgLoc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}"/>
    <xhtml:link rel="alternate" hreflang="bg" href="${bgLoc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enLoc}"/>
  </url>`,
          ]
        }).join('')

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})
