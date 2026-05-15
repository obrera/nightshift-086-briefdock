import { env } from '@workspace/env/server'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { briefdockRoutes } from './briefdock/briefdock-routes.ts'
import { rootRoutes } from './routes/root.ts'

const app = new Hono()

app.use('*', cors({ origin: env.CORS_ORIGINS }))

app.route('/api', briefdockRoutes)
app.route('/', rootRoutes)
app.use('/assets/*', serveStatic({ root: './apps/web/dist' }))
app.use('/favicon.ico', serveStatic({ path: './apps/web/dist/favicon.ico' }))
app.get('*', serveStatic({ path: './apps/web/dist/index.html' }))

export default {
  fetch: app.fetch,
  port: env.PORT,
}
