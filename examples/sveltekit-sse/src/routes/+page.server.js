import sse from '$lib/sse-manager.server.js';

/** @type {import('./$types').Actions} */
export const actions = {
	async emit_to_all(event) {
		const data = await event.request.formData();

		sse.emit_to_all({
			event: 'client:message',
			data: JSON.stringify({ text: data.get('text') })
		});
	},
	async emit_to(event) {
		const data = await event.request.formData();

		sse.emit_to(data.get('id'), {
			event: 'client:message',
			data: JSON.stringify({ text: data.get('text') })
		});
	}
};
