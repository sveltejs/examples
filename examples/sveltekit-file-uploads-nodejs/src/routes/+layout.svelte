<script>
	import '$lib/css/styles.css';
</script>

<main>
	<slot />
</main>

<style>
	main {
		margin-block-start: 3rem;
		padding: 1rem;
	}

	:global(main > *) {
		max-width: 60rem;
		margin-inline: auto;
	}
</style>
