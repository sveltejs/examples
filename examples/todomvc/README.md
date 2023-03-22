# Todo MVC

An example implementation of the Todo MVC app. It uses SvelteKit's [format actions](https://kit.svelte.dev/docs/form-actions). It uses progressive enhancement, which means the app is still functional without JavaScript - but when it _is_ available, it provides a nicer experience by having optimistic UI updates, for example showing the new TODO item before it actually exists in the database.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
