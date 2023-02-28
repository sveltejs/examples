import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { fail } from '@sveltejs/kit';

const DIR = process.env.FILES_DIR ?? 'temp-files';

if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR, { recursive: true });
}

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
  const file_name = event.request.headers.get('x-file-name');

  if (!file_name) {
    event.request.body?.cancel();
    return new Response(null, { status: 400 });
  }

  const file_path = path.normalize(path.join(DIR, file_name));

  if (fs.existsSync(file_path)) {
    event.request.body?.cancel();
    return new Response(null, { status: 400 });
  }

  if (event.request.body instanceof ReadableStream === false){
    return new Response(null, { status: 400 });
  }

  const nodejs_wstream = fs.createWriteStream(file_path);
  // Convert Web `ReadableStream` to a Node.js `Readable` stream
  const web_rstream = event.request.body;
  const nodejs_rstream = Readable.fromWeb(web_rstream);
  // Write file to disk and wait for it to finish
  await pipeline(nodejs_rstream, nodejs_wstream).catch(error => {
		fs.unlinkSync(file_path);

    return new Response(null, { status: 500 });
  });

  return new Response();
}