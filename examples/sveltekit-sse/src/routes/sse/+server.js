import sse from '$lib/sse-manager.server.js';

sse.on_connected((id, controllers) => {
	// Send a list of all currently connected users to the user
	const clients = Array.from(sse.get_all_clients(), ([id, controllers]) => ({
		id,
		connections: controllers.size
	}));

	sse.emit_to_all({
		event: 'client:list',
		data: JSON.stringify({ clients })
	});
});

sse.on_disconnected((id, controllers) => {
	// Send a list of all currently connected users to the user
	const clients = Array.from(sse.get_all_clients(), ([id, controllers]) => ({
		id,
		connections: controllers.size
	}));

	sse.emit_to_all({
		event: 'client:list',
		data: JSON.stringify({ clients })
	});
});

/** @type {import('./$types').RequestHandler} */
export function GET(event) {
	if (!event.locals.id) {
		return new Response(null, { status: 401 });
	}

	const stream = sse.connect(event.locals.id);

	if (!stream) {
		return new Response(null, { status: 503 });
	}

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream'
		}
	});
}
