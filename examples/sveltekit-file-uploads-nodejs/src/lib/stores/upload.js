import { writable } from 'svelte/store';

export function create_upload() {
  const { subscribe, set, update } = writable({ status: 'idle', progress: 0 });

  let xhr;

  return {
    subscribe,

    start({ file, url, headers = {} }) {
      xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        let progress;

        if (event.lengthComputable) {
          progress = (event.loaded / event.total) * 100;
        }

        update(state => ({ ...state, status: 'uploading', progress }));
      });

      xhr.addEventListener("loadend", (event) => {
        const status = xhr.status < 400 ? 'completed' : 'error';

        update(state => ({ ...state, status }));
      });

      xhr.upload.addEventListener("error", (event) => {
        update(state => ({ ...state, progress: 0, status: 'error' }));
      });

      xhr.open('POST', url);

      for (const [name, value] of Object.entries(headers)) {
        xhr.setRequestHeader(name, value);
      }

      xhr.send(file);
    }
  }
}

export default create_upload;