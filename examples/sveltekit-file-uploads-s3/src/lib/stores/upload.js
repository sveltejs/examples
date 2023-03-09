import { writable } from 'svelte/store';

export function create_upload() {
  const { subscribe, set, update } = writable({ status: 'idle', progress: 0 });

  let xhr;

  return {
    subscribe,

    start({ file }) {
      return new Promise((resolve, reject) => {
        update(state => ({ ...state, progress: 0, status: 'uploading ' }));

        const opts = {
          method: 'POST',
          body: JSON.stringify({ key: file.name, type: file.type })
        }

        fetch('/presigned-url', opts).then(res => res.ok && res.json()).then(json => {
          if (!json) {
            update(state => ({ ...state, status: 'error ' }));
            reject();
            return;
          }

          const { url, method, headers } = json;

          xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            let progress = 0;

            if (event.lengthComputable) {
              progress = (event.loaded / event.total) * 100;
            }

            update(state => ({ ...state, status: 'uploading', progress }));
          });

          xhr.upload.addEventListener("error", (event) => {
            update(state => ({ ...state, progress: 0, status: 'error' }));
          });

          xhr.addEventListener("loadend", (event) => {
            const status = xhr.status > 0 && xhr.status < 400 ? 'completed' : 'error';

            update(state => ({ ...state, status }));

            if (status === 'error') {
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
        }).catch(err => {
          update(state => ({ ...state, status: 'error ' }));
          reject();
        });
      });
    }
  }
}

export default create_upload;