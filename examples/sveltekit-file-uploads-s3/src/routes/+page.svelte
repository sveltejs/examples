<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { PUBLIC_S3_BUCKET_URL } from '$env/static/public';
	import create_upload from '$lib/stores/upload.js';

	/** @type {import('./$types').PageData} */
	export let data;

	const upload = create_upload();

	let is_small_submitting = false;
	let is_large_submitting = false;

	const progress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	$: progress.set($upload.progress / 100);

	/** @param {SubmitEvent} event */
	async function handle_large_submit(event) {
		is_large_submitting = true;

		const target = /** @type {EventTarget & HTMLFormElement} */ (event.target);
		const file = target.elements.file.files[0];

		await upload.start({ file });
		await invalidateAll();
		progress.set(0);
		// Reset file input
		target.reset();

		is_large_submitting = false;
	}
</script>

<h1>Upload and view files with SvelteKit and S3</h1>

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
				Uploading... {$upload.progress}%
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
		<ol class="files">
			{#each data.files as file (file.Key)}
				<li class="file" transition:slide={{ duration: 200 }}>
					<span class="file__size">{(file.Size / 1000).toFixed(1)} kB</span>
					<a
						class="file__name"
						href="{PUBLIC_S3_BUCKET_URL}/{file.Key}"
						target="_blank"
						rel="noreferrer"
					>
						{file.Key}
					</a>
					<form
						class="file__delete-action"
						method="POST"
						action="?/delete"
						enctype="multipart/form-data"
						use:enhance={({ submitter }) => {
							submitter?.setAttribute('disabled', 'true');
							submitter?.classList.add('--loading');

							return async ({ update }) => {
								await update();
								submitter?.classList.remove('--loading');
								submitter?.removeAttribute('disabled');
							};
						}}
					>
						<button name="key" value={file.Key}>Delete</button>
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
		border-radius: 7px;
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
		border-radius: 7px;
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

	.file__delete-action {
		flex: 0 0 auto;
	}
</style>
