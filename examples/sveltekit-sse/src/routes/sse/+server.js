import sse from '$lib/sse-manager.server.js';

sse.on_connected((client_id, controllers) => {
	// Send a list of all currently connected users to the user
	const clients = Array.from(sse.get_clients().keys());

	sse.emit_to_all({
		event: 'client:list',
		data: JSON.stringify({ clients })
	});
});

// If the user has closed all connected tabs
// send a message to all other users
sse.on_disconnected((client_id, controllers) => {
	// Send a list of all currently connected users to the user
	const clients = Array.from(sse.get_clients().keys());

	sse.emit_to_all({
		event: 'client:list',
		data: JSON.stringify({ clients })
	});
});

/** @type {import('./$types').RequestHandler} */
export async function GET(event) {
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
