import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fail } from '@sveltejs/kit';
import { FILES_DIR } from './files-dir';

if (!fs.existsSync(FILES_DIR)) {
	fs.mkdirSync(FILES_DIR, { recursive: true });
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const file_names = fs.readdirSync(FILES_DIR);

	const files = file_names.map((name) => {
		const stats = fs.statSync(path.normalize(path.join(FILES_DIR, name)));

		return {
			name,
			size: stats.size,
			last_modified: stats.mtime
		};
	});

	return { files };
}

/** @type {import('./$types').Actions} */
export const actions = {
	async upload(event) {
		const data = await event.request.formData();
		const file = /** @type {File} */ (data.get('file'));

		if (file instanceof File === false || file.size === 0) {
			return fail(400);
		}

		const file_path = path.normalize(path.join(FILES_DIR, file.name));

		if (fs.existsSync(file_path)) {
			return fail(400);
		}

		const nodejs_wstream = fs.createWriteStream(file_path);
		// Convert Web `ReadableStream` to a Node.js `Readable` stream
		const web_rstream = file.stream();
		const nodejs_rstream = Readable.fromWeb(web_rstream);
		// Write file to disk and wait for it to finish
		await pipeline(nodejs_rstream, nodejs_wstream).catch(() => {
			return fail(500);
		});
	},

	async delete(event) {
		const data = await event.request.formData();
		const file_name = /** @type {string} */ (data.get('file_name'));

		if (!file_name) {
			return fail(400);
		}

		const file_path = path.normalize(path.join(FILES_DIR, file_name));

		if (!fs.existsSync(file_path)) {
			return fail(400);
		}

		fs.unlinkSync(file_path);
	}
};
