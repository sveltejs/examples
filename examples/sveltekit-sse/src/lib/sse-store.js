import { browser } from '$app/environment';
import { writable } from 'svelte/store';

function create_sse_store() {
	/** @type {EventSource | undefined} */
	let event_source;

	const { subscribe, update } = writable({ clients: [], messages: [], status: 'closed' }, () => {
		if (browser) {
			connect();
		}

		return close;
	});

	function connect() {
		event_source = new EventSource('/sse');

		event_source.addEventListener('error', (event) => {
			console.info('error')
			update((value) => ({ ...value, status: 'error' }));
		});

		event_source.addEventListener('open', (event) => {
			console.info('open')

			update((value) => ({ ...value, status: 'open' }));
		});

		event_source.addEventListener('client:list', (event) => {
			console.info('client:list')

			const json = JSON.parse(event.data);

			update((value) => ({ ...value, ...json }));
		});

		event_source.addEventListener('client:message', (event) => {
			console.info('client:message')

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

const sse_store = create_sse_store();

export default sse_store;
