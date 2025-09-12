<script>
	import '$lib/css/styles.css';
	let { children } = $props();
</script>

<main>
	{@render children()}
</main>

<style>
	main {
		padding: 1rem;
	}

	:global(main > *) {
		max-width: 60rem;
		margin-inline: auto;
	}
</style>
