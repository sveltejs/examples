/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	let id = event.cookies.get('id');

	if (!id) {
		id = crypto.randomUUID();
		event.cookies.set('id', id);
	}

	event.locals.id = id;

	return await resolve(event);
}
