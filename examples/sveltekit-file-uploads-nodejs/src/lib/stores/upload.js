import { writable } from 'svelte/store';

export function create_upload() {
	const { subscribe, update } = writable({ status: 'idle', progress: 0 });

	/** @type {XMLHttpRequest} */
	let xhr;

	return {
		subscribe,

		/** @param {{file: File, url: string, headers: Record<string, string>}} input */
		start({ file, url, headers = {} }) {
			return new Promise((resolve, reject) => {
				xhr = new XMLHttpRequest();

				xhr.upload.addEventListener('progress', (event) => {
					/** @type {number} */
					let progress;

					if (event.lengthComputable) {
						progress = (event.loaded / event.total) * 100;
					}

					update((state) => ({ ...state, status: 'uploading', progress }));
				});

				xhr.addEventListener('loadend', () => {
					const status = xhr.status > 0 && xhr.status < 400 ? 'completed' : 'error';

					update((state) => ({ ...state, status }));

					if (status === 'error') {
						reject();
					} else {
						resolve(xhr);
					}
				});

				xhr.upload.addEventListener('error', () => {
					update((state) => ({ ...state, progress: 0, status: 'error' }));
				});

				xhr.open('POST', url);

				for (const [name, value] of Object.entries(headers)) {
					xhr.setRequestHeader(name, value);
				}

				xhr.send(file);
			});
		}
	};
}

export default create_upload;
