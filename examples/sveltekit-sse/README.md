# SvelteKit SSE Example

A simple SvelteKit example that implements the SSE protocol and works with multiple users. Each user is assigned a cookie with a random ID using `crypto.randomUUID()` to identify each client and limit the number of connections.

## `lib/sse-manager.server.js`

This file keeps track of all `ReadableStream`s/SSE connections and allows you to emit events to all or only specific clients. The code is portable and works in all JavaScript envionments that accept `ReadableStream`s as HTTP responses including SvelteKit, Deno and Bun.

## `lib/sse-store.js`

This file contains a custom store that opens the SSE connection, listens for events emitted from the server and updates the store's value accordingly.

**Note:** SSE requires a contionously open HTTP connection so in order to use `sse-manager.server.js` it needs to be deployed to Edge functions, a server using `adapter-node` or as a separate Deno or Bun app. Serverless functions have an execution limit of only a few seconds and therefore don't work.