<script>
	import Counter from '$lib/Counter.svelte';
</script>

<main>
	<h1>Counter Library</h1>

	<p>A library example using @sveltejs/package with a preview of the work using SvelteKit</p>

	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

	<div class="example">
		<h2>Simple counter</h2>
		<Counter />
	</div>

	<div class="example">
		<h2>Custom start value</h2>
		<Counter count={10} />
	</div>

	<div class="example">
		<h2>Listening to the change event</h2>
		<Counter on:change={(e) => alert('The count is ' + e.detail)} />
	</div>

	<div class="example">
		<h2>Custom slot</h2>
		<Counter let:count>
			<p class="purple">The count is {count}</p>
		</Counter>
	</div>
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
		padding: 1em;
	}

	.example {
		border: 1px solid #ccc;
		padding: 1em;
		margin: 1em 0;
	}

	.purple {
		color: purple;
		font-weight: bold;
	}
</style>
