import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { FILES_DIR } from '../files-dir';

if (!fs.existsSync(FILES_DIR)) {
	fs.mkdirSync(FILES_DIR, { recursive: true });
}

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	if (!event.request.body) {
		return new Response(null, { status: 400 });
	}

	const file_name = event.request.headers.get('x-file-name');

	if (!file_name) {
		event.request.body.cancel();
		// Note: This does not do anything if the body is cancelled
		// but we return it anyway
		return new Response(null, { status: 400 });
	}

	const file_path = path.normalize(path.join(FILES_DIR, file_name));

	if (fs.existsSync(file_path)) {
		event.request.body.cancel();
		// Note: This does not do anything if the body is cancelled
		// but we return it anyway
		return new Response(null, { status: 400 });
	}

	const nodejs_wstream = fs.createWriteStream(file_path);
	// Convert Web `ReadableStream` to a Node.js `Readable` stream
	const web_rstream = event.request.body;
	const nodejs_rstream = Readable.fromWeb(web_rstream);
	// Write file to disk and wait for it to finish
	try {
		await pipeline(nodejs_rstream, nodejs_wstream);
	} catch (e) {
		fs.unlinkSync(file_path);
		return new Response(null, { status: 500 });
	}

	return new Response();
}
