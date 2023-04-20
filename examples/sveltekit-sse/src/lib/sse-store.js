import { browser } from '$app/environment';
import { writable } from 'svelte/store';

function create_sse_store(init = false) {
	/** @type {EventSource | undefined} */
	let event_source;

	const { subscribe, update } = writable({ clients: [], messages: [], status: 'closed' }, () => {
		if (init) connect();

		return close;
	});

	function on_error(e) {
		update((value) => ({ ...value, status: 'error' }));
	}
	function on_open(e) {
		update((value) => ({ ...value, status: 'open' }));
	}
	function on_client_list(e) {
		const json = JSON.parse(e.data);
		update((value) => ({ ...value, ...json }));
	}
	function on_client_message(e) {
		const json = JSON.parse(e.data);
	
		update((value) => {
			value.messages.push(json);
			return value;
		});
	}

	function connect() {
		event_source = new EventSource('/sse');

		event_source.addEventListener('error', on_error);
		event_source.addEventListener('open', on_open);
		event_source.addEventListener('client:list', on_client_list);
		event_source.addEventListener('client:message', on_client_message);
	}

	function close() {
		event_source?.close();

		event_source?.removeEventListener('error', on_error);
		event_source?.removeEventListener('open', on_open);
		event_source?.removeEventListener('client:list', on_client_list);
		event_source?.removeEventListener('client:message', on_client_message);
	}

	return {
		subscribe
	};
}

const sse_store = create_sse_store(browser);

export default sse_store;
