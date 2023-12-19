import { browser } from '$app/environment';
import { writable } from 'svelte/store';

function create_sse_store(init = true) {
	/** @type {EventSource | undefined} */
	let event_source;

	const { subscribe, update } = writable({ clients: [], messages: [], status: 'closed' }, () => {
		if (init) open();

		return close;
	});

	function open() {
		event_source = new EventSource('/sse');

		event_source.addEventListener('error', (event) => {
			update((value) => ({ ...value, status: 'error' }));
		});

		event_source.addEventListener('open', (event) => {
			update((value) => ({ ...value, status: 'open' }));
		});

		event_source.addEventListener('client:list', (event) => {
			const json = JSON.parse(event.data);

			update((value) => ({ ...value, ...json }));
		});

		event_source.addEventListener('client:message', (event) => {
			const json = JSON.parse(event.data);

			update((value) => {
				value.messages.push(json);
				return value;
			});
		});
	}

	function close() {
		event_source?.close();
	}

	return {
		subscribe
	};
}

const sse_store = create_sse_store(browser);

export default sse_store;
