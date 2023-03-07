<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	import { create_upload } from '$lib/stores/upload';

	/** @type {import('./$types').PageData} */
	export let data;
	/** @type {import('./$types').ActionData} */
	export let form;

	const upload = create_upload();

	const progress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	$: switch ($upload.status) {
		case 'uploading':
			progress.set(Math.ceil($upload.progress) / 100);
			break;

		case 'error':
			progress.set(0);
			break;

		case 'completed':
			invalidateAll().then(_ => progress.set(0));
			break;
	}

	function handle_large_submit(event) {
		const file = event.currentTarget.elements['file'].files[0];

		const headers = { 'x-file-name': file.name };

		upload.start({ url: '/upload', file, headers });
	}
</script>

<h1>Upload and view files with SvelteKit and Node.js</h1>

<div class="forms">
	<form class="small" method="POST" action="?/upload" enctype="multipart/form-data" use:enhance>
		<div>
			<label for="file">Select a small file</label>
			<input type="file" name="file" id="file" required />
		</div>
		<button>Upload</button>
	</form>

	<form class="large" on:submit|preventDefault={handle_large_submit}>
		<div>
			<label for="file">Select a large file</label>
			<input type="file" name="file" id="file" required />
		</div>
		<progress value={$progress} />
		<button disabled={$upload.status === 'uploading'}>Upload</button>
	</form>
</div>

<section aria-label="Uploaded files">
	<h2>Uploaded files</h2>
	{#if !data?.files.length}
		<p>No files have been uploaded yet.</p>
	{:else}
		<ol class="files">
			{#each data.files as file (file.name)}
				<li class="file" transition:slide={{ duration: 200 }}>
					<span class="file__size">{(file.size / 1000).toFixed(1)} kB</span>
					<a class="file__name" href="/files/{file.name}" target="_blank" rel="noreferrer">
						{file.name}
					</a>
					<form
						class="file__actions"
						use:enhance
						method="POST"
						action="?/delete"
						enctype="multipart/form-data"
					>
						<button name="file_name" value={file.name}>Delete</button>
					</form>
				</li>
			{/each}
		</ol>
	{/if}
</section>

<style>
	.forms {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-block-end: 2rem;
	}

	.forms > form {
		display: flex;
		gap: 1rem;
		flex-direction: column;
		justify-content: space-between;
		padding: 1rem;
		border-radius: var(--border-radius);
		background-color: hsla(0, 0%, 0%, 0.07);

		flex: 1 0 20rem;
	}

	.forms > form > button {
		margin-block-start: 1rem;
	}

	.files {
		padding: 0;
	}

	.file {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem;
		border-radius: var(--border-radius);
		font-size: 1.2rem;

		transition: background-color, 100ms;
	}

	.file:hover {
		background-color: hsla(0, 0%, 0%, 0.07);
	}

	.file__size {
		flex: 0 0 15ch;
		font-family: monospace;
	}

	.file__name {
		flex: 1 1 auto;
	}

	.file__actions {
		flex: 0 0 auto;
	}
</style>
