/**
 * @typedef {Object} Message - https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
 * @property {string} data - The data field for the message.
 * @property {string} [event] - A string identifying the type of event described. If this is specified, an event will be dispatched on the browser to the listener for the specified event name; the website source code should use addEventListener() to listen for named events. The onmessage handler is called if no event name is specified for a message.
 * @property {string | number} [id] - The event ID to set the EventSource object's last event ID value.
 * @property {number} [retry] - The reconnection time. If the connection to the server is lost, the browser will wait for the specified time before attempting to reconnect. This must be an integer, specifying the reconnection time in milliseconds.
 */

/**
 * @callback ConnectionCallback
 * @param {string | number} id
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
	const on_connected_callbacks = new Set();
	/** @type {Set<ConnectionCallback>} */
	const on_disconnected_callbacks = new Set();

	return {
		/**
		 * @param {string | number} id
		 * @returns {ReadableStream | void}
		 */
		connect(id) {
			if (clients.size >= max_clients) {
				return;
			}

			if (clients.has(id) === false) {
				clients.set(id, new Set());
			}

			const controllers = /** @type {Set<ReadableStreamDefaultController>} */ (
				clients.get(id)
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

					on_connected_callbacks.forEach((cb) => cb(id, controllers));
				},
				cancel() {
					controllers.delete(controller);

					if (controllers.size === 0) {
						clients.delete(id);
					}

					on_disconnected_callbacks.forEach((cb) => cb(id, controllers));
				}
			});

			return stream;
		},

		/** @param {ConnectionCallback} cb */
		on_connected(cb) {
			on_connected_callbacks.add(cb);
		},

		/** @param {ConnectionCallback} cb */
		on_disconnected(cb) {
			on_disconnected_callbacks.add(cb);
		},

		/**
		 * @param {string | number | Array<string | number>} id
		 * @param {Message} message
		 */
		emit_to(id, message) {
			const ids = Array.isArray(id) ? id : [id];

			const message_string = create_message_string(message);
			
			for (const id of ids) {
				const controllers = clients.get(id);

				if (!controllers) continue;

				controllers.forEach((c) => c.enqueue(message_string));
			}
		},

		/**
		 * @param {Message} message
		 * @param {Array<number | string>} [exclude=[]]
		 */
		emit_to_all(message, exclude = []) {
			const message_string = create_message_string(message);

			for (const [id, controllers] of clients) {
				if (exclude.includes(id)) continue;

				controllers.forEach((c) => c.enqueue(message_string));
			}
		},

		get_all_clients() {
			return clients;
		}
	};
}

const sse_manager = create_sse_manager();

export default sse_manager;
