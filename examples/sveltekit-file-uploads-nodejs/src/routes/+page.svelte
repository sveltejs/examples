<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { create_upload } from '$lib/stores/upload';

	/** @type {import('./$types').PageData} */
	export let data;

	const upload = create_upload();

	let is_small_submitting = false;
	let is_large_submitting = false;

	const progress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	$: progress.set(Math.ceil($upload.progress) / 100);

	/** @param {SubmitEvent} event */
	async function handle_large_submit(event) {
		is_large_submitting = true;

		const target = /** @type {EventTarget & HTMLFormElement} */ (event.target);
		const file = target.elements.file.files[0];
		const headers = { 'x-file-name': file.name };

		await upload.start({ url: '/upload', file, headers });
		await invalidateAll();
		progress.set(0);
		// Reset file input
		target.reset();

		is_large_submitting = false;
	}
</script>

<h1>Upload and view files with SvelteKit and Node.js</h1>

<div class="forms">
	<form
		class="small"
		method="POST"
		action="?/upload"
		enctype="multipart/form-data"
		use:enhance={() => {
			is_small_submitting = true;

			return ({ update }) => {
				update().then(() => {
					is_small_submitting = false;
				});
			};
		}}
	>
		<div>
			<label for="file">Select a small file</label>
			<input type="file" name="file" id="file" required />
		</div>
		<button disabled={is_small_submitting} class:--loading={is_small_submitting}>
			{#if is_small_submitting}
				Uploading...
			{:else}
				Upload
			{/if}
		</button>
	</form>

	<form class="large" on:submit|preventDefault={handle_large_submit}>
		<div>
			<label for="file">Select a large file</label>
			<input type="file" name="file" id="file" required />
		</div>
		<progress value={$progress} />
		<button disabled={is_large_submitting} class:--loading={is_large_submitting}>
			{#if is_large_submitting}
				Uploading...
			{:else}
				Upload
			{/if}
		</button>
	</form>
</div>

<section aria-label="Uploaded files">
	<h2>Uploaded files</h2>
	{#if !data?.files.length}
		<p>No files have been uploaded yet.</p>
	{:else}
		<ol
			class="files"
			on:submitstart={(e) => {
				const button = e.target.querySelector('button');
				button?.classList.add('--loading');
				button?.setAttribute('disabled', 'true');
			}}
			on:submitend={(e) => {
				const button = e.target.querySelector('button');
				button?.classList.remove('--loading');
				button?.removeAttribute('disabled');
			}}
		>
			{#each data.files as file (file.name)}
				<li class="file" transition:slide={{ duration: 200 }}>
					<span class="file__size">{(file.size / 1000).toFixed(1)} kB</span>
					<a class="file__name" href="/files/{file.name}" target="_blank" rel="noreferrer">
						{file.name}
					</a>
					<form
						class="file__actions"
						method="POST"
						action="?/delete"
						enctype="multipart/form-data"
						use:enhance={({ form }) => {
							form.dispatchEvent(new Event('submitstart', { bubbles: true }));

							return ({ update }) => {
								update().then(() => form.dispatchEvent(new Event('submitend', { bubbles: true })));
							};
						}}
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
