import sse from '$lib/sse-manager.server.js';

sse.on_connect((client_id, controllers) => {
	// Send a list of all currently connected users to the user
	const clients = Array.from(sse.get_clients().keys());

	console.log(clients);

	sse.emit_to_all({
		event: 'client:list',
		data: JSON.stringify({ clients })
	});
});

// If the user has closed all connected tabs
// send a message to all other users
sse.on_disconnect((client_id, controllers) => {
	if (controllers.size > 0) return;

	const message = { event: 'client:disconnected', data: JSON.stringify({ client_id }) };

	sse.emit_to_all(message);
});

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const id = crypto.randomUUID();

	const stream = sse.connect(id);

	if (!stream) {
		return new Response(null, { status: 503 });
	}

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream'
		}
	});
}
