import sse from '$lib/sse-manager.server.js';

/** @type {import('./$types').Actions} */
export const actions = {
	async emit_to_all(event) {
		const data = await event.request.formData();

		const message = JSON.stringify({ text: data.get('text') });

		sse.emit_to_all({ event: 'message', data: message });
	},
	async emit_to(event) {
		const data = await event.request.formData();

		const message = JSON.stringify({ text: data.get('text') });

		sse.emit_to(data.get('client_id'), { event: 'message', data: message });
	}
};
