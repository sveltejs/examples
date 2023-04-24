<script>
	import '$lib/global.css';
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import sse from '$lib/sse-store.js';
</script>

<main>
	<h1>SvelteKit SSE Example</h1>

	{#if $sse.status}
		<p
			class="status"
			class:--closed={$sse.status === 'closed'}
			class:--open={$sse.status === 'open'}
			class:--error={$sse.status === 'error'}
			role="alert"
		>
			Status: <span>{$sse.status}</span>
		</p>
	{/if}

	<div class="box">
		<p>Send a message to all connected clients</p>
		<form action="?/emit_to_all" method="POST" use:enhance>
			<div>
				<label for="text">Message</label>
				<input type="text" id="text" name="text" />
			</div>
			<button>Send</button>
		</form>
	</div>

	<h2>Messages</h2>

	<ol class="messages box">
		{#each $sse.messages as message (message)}
			<li class="message" transition:slide={{ duration: 200 }}>{message.text}</li>
		{/each}
	</ol>

	<h2>Connected clients</h2>

	<ul class="clients">
		{#each $sse.clients as client (client)}
			<li class="client box" transition:slide={{ duration: 200 }}>
				<div>
					<div>
						Connections: <strong>{client.connections}</strong>
					</div>
					<div>
						Client ID: <strong>{client.id}</strong>
					</div>
				</div>

				<form action="?/emit_to" method="POST" use:enhance>
					<div>
						<label for="text">Message</label>
						<input type="text" id="text:{client.id}" name="text" />
					</div>
					<input type="hidden" name="id" value={client.id} />
					<button>Send</button>
				</form>
			</li>
		{/each}
	</ul>
</main>

<style>
	main {
		max-width: 40rem;
		margin-inline: auto;
		padding: 1rem;
	}

	.clients {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
	}

	.status {
		font-weight: 600;
	}

	.status.--open {
		color: green;
	}

	.status.--error {
		color: red;
	}

	ul,
	ol {
		list-style: none;
	}

	p {
		margin-block-end: 1rem;
	}

	form {
		display: flex;
		align-items: end;
		gap: 1rem;
	}

	form > div {
		flex: 1;
	}

	button,
	input {
		height: 2.5rem;
		padding-inline: 1rem;
	}
</style>
