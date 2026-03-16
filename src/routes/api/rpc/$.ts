import { RPCHandler } from '@orpc/server/fetch'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { appRouter } from '#/server/router'

const handler = new RPCHandler(appRouter, {
  prefix: '/api/rpc',
})

async function handleRequest(request: Request): Promise<Response> {
  const { matched, response } = await handler.handle(request, {
    context: { headers: request.headers },
    prefix: '/api/rpc',
  })
  if (matched) return response
  return new Response('Not found', { status: 404 })
}

export const APIRoute = createAPIFileRoute('/api/rpc/$')({
  GET: ({ request }) => handleRequest(request),
  POST: ({ request }) => handleRequest(request),
})
