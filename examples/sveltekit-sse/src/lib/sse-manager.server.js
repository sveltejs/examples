/**
 * @typedef {Object} Message - https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
 * @property {string} data - The data field for the message.
 * @property {string} [event] - A string identifying the type of event described. If this is specified, an event will be dispatched on the browser to the listener for the specified event name; the website source code should use addEventListener() to listen for named events. The onmessage handler is called if no event name is specified for a message.
 * @property {string | number} [id] - The event ID to set the EventSource object's last event ID value.
 * @property {number} [retry] - The reconnection time. If the connection to the server is lost, the browser will wait for the specified time before attempting to reconnect. This must be an integer, specifying the reconnection time in milliseconds.
 */

/**
 * @callback ConnectionCallback
 * @param {string | number} client_id
 * @param {Set<ReadableStreamDefaultController>} controllers
 * @returns {void}
 */

/** @param {Message} message */
function create_message_string(message) {
	return (
		Object.entries(message)
			.map(([key, value]) => `${key}: ${value}`)
			.join('\n') + '\n\n'
	);
}

function create_sse_manager({ max_clients = 1_000, max_connections_per_client = 3 } = {}) {
	/** @type {Map<string | number, Set<ReadableStreamDefaultController>>} */
	const clients = new Map();
	/** @type {Set<ConnectionCallback>} */
	const on_connect_listeners = new Set();
	/** @type {Set<ConnectionCallback>} */
	const on_disconnect_listeners = new Set();

	return {
		/**
		 * @param {string | number} client_id
		 * @returns {ReadableStream | void}
		 */
		connect(client_id) {
			if (clients.size >= max_clients) {
				return;
			}

			if (clients.has(client_id) === false) {
				clients.set(client_id, new Set());
			}

			const controllers = /** @type {Set<ReadableStreamDefaultController>} */ (
				clients.get(client_id)
			);

			if (controllers.size >= max_connections_per_client) {
				return;
			}

			/** @type {ReadableStreamDefaultController} */
			let controller;

			const stream = new ReadableStream({
				start(_controller) {
					controller = _controller;
					controllers.add(controller);

					on_connect_listeners.forEach((fn) => fn(client_id, controllers));
				},
				cancel() {
					controllers.delete(controller);

					if (controllers.size === 0) {
						clients.delete(client_id);
					}

					on_disconnect_listeners.forEach((fn) => fn(client_id, controllers));
				}
			});

			return stream;
		},

		/** @param {ConnectionCallback} fn */
		on_connect(fn) {
			on_connect_listeners.add(fn);
		},

		/** @param {ConnectionCallback} fn */
		on_disconnect(fn) {
			on_disconnect_listeners.add(fn);
		},

		/**
		 * @param {string | number} client_id
		 * @param {Message} message
		 */
		emit_to(client_id, message) {
			/** @type {Set<ReadableStreamDefaultController> | undefined} */
			const controllers = clients.get(client_id);

			if (!controllers) return;

			const message_string = create_message_string(message);

			controllers.forEach((c) => c.enqueue(message_string));
		},

		/**
		 * @param {Message} message
		 * @param {Array<number | string>} [exclude=[]]
		 */
		emit_to_all(message, exclude = []) {
			const message_string = create_message_string(message);

			for (const [client_id, controllers] of clients) {
				if (exclude.includes(client_id)) continue;

				controllers.forEach((c) => c.enqueue(message_string));
			}
		}
	};
}

const sse_manager = create_sse_manager();

export default sse_manager;
