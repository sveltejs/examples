export class Upload {
	status = $state('idle');
	progress = $state(0);
 

	/** @param {{file: File}} input */
	start({ file }) {
		return new Promise((resolve, reject) => {
			this.progress = 0;
			this.status = 'uploading';

			const opts = {
				method: 'POST',
				body: JSON.stringify({ key: file.name, type: file.type })
			};

			fetch('/presigned-url', opts)
				.then((res) => res.ok && res.json())
				.then((json) => {
					if (!json) {
						this.status = 'error';
						reject();
						return;
					}

					const { url, method, headers } = json;

					const xhr = new XMLHttpRequest();

					xhr.upload.addEventListener('progress', (event) => {
						let progress_value = 0;

						if (event.lengthComputable) {
							progress_value = Math.round((event.loaded / event.total) * 100);
						}

						this.status = 'uploading';
						this.progress = progress_value;
					});

					xhr.upload.addEventListener('error', () => {
						this.progress = 0;
						this.status = 'error';
					});

					xhr.addEventListener('loadend', () => {
						const request_status = xhr.status > 0 && xhr.status < 400 ? 'completed' : 'error';

						this.status = request_status;

						if (request_status === 'error') {
							reject();
						} else {
							resolve(xhr);
						}
					});

					xhr.open(method, url);

					for (const [name, value] of Object.entries(headers)) {
						xhr.setRequestHeader(name, value);
					}

					xhr.send(file);
				})
				.catch(() => {
					this.status = 'error';
					reject();
				});
		});
	}
}
 