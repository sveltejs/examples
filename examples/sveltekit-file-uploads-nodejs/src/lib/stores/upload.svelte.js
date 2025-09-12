export class Upload {
	status = $state('idle');
	progress = $state(0);

	/** @param {{file: File, url: string, headers: Record<string, string>}} input */
	start({ file, url, headers = {} }) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener('progress', (event) => {
				/** @type {number} */
				let progress = 0;

				if (event.lengthComputable) {
					progress = Math.round((event.loaded / event.total) * 100);
				}

				this.status = 'uploading';
				this.progress = progress;
			});

			xhr.addEventListener('loadend', () => {
				const status = xhr.status > 0 && xhr.status < 400 ? 'completed' : 'error';
				this.status = status;
				resolve(xhr);
			});

			xhr.upload.addEventListener('error', () => {
				this.progress = 0;
				this.status = 'error';
			});

			xhr.open('POST', url);

			for (const [name, value] of Object.entries(headers)) {
				xhr.setRequestHeader(name, value);
			}

			xhr.send(file);
		});
	}
}
