<script>
	import '$lib/global.css';
	import { enhance } from '$app/forms';
	import sse from '$lib/sse-store.js';
</script>

<main>
	<h1>SvelteKit SSE Example</h1>

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

	<h2>Connected clients</h2>

	<ul class="clients">
		{#each $sse.clients as client_id (client_id)}
			<li class="client box">
				<p>
					Client ID: <strong class="client__id">{client_id} </strong>
				</p>

				<form action="?/emit_to" method="POST" use:enhance>
					<div>
						<label for="text">Message</label>
						<input type="text" id="text:{client_id}" name="text" />
					</div>
					<input type="hidden" name="client_id" value={client_id} />
					<button>Send</button>
				</form>
			</li>
		{/each}
	</ul>

	<ol class="messages">
		{#each $sse.messages as message (message)}
			<li class="message">{message.text}</li>
		{/each}
	</ol>
</main>

<style>
	main {
		max-width: 40em;
		margin-inline: auto;
	}

	.clients {
		list-style: none;
		display: flex;
		flex-direction: column;
		row-gap: 2rem;
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
