# Counter Library

A Svelte library created with [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Developing

Install dependencies with `npm install` (or `pnpm install` or `yarn`), and start a development server:

```bash
npm run dev
```

Develop your library within `src/lib`. Reexport everything that should be publicly available from `src/lib/index.js`. Preview/showcase your work within `src/routes`. In this example, there's one Counter component.

## Building

To prepare the library for release, run

```bash
npm run package
```

This will output everything that's inside `src/lib` into the `dist` folder, transforming TypeScript to JavaScript and creating type definitions. To publish the library to npm, run

```bash
npm publish
```

The result would be available for others as

```svelte
<script>
	import { Counter } from 'your-library';
</script>

<Counter />
```

## More info

Read the [packaging docs](https://kit.svelte.dev/docs/packaging) for more info on how to create a Svelte library.
