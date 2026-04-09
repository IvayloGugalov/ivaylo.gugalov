import { paraglideMiddleware } from './paraglide/server'
import handler from '@tanstack/react-start/server-entry'

// Wrap the TanStack Start handler with Paraglide's middleware so that each
// server request gets its own async-local-storage locale context.
// Without this, setLocale() on the server is a global mutation that races
// under concurrent requests.
export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => handler.fetch(req))
  },
}
