
import { S3 } from '$lib/s3.server.js';
import { env } from '$env/dynamic/private';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
  const body = await event.request.json();

  if (typeof body.key !== 'string') {
    return new Response(null, { status: 400 });
  }

  if (typeof body.type !== 'string') {
    return new Response(null, { status: 400 });
  }

  const put_object_params = {
    Bucket: env.S3_BUCKET,
    Key: body.key,
    ContentLength: body.size
  }

  const url = await getSignedUrl(S3, new PutObjectCommand(put_object_params), { expiresIn: 3600 })
  const method = 'PUT';
  const headers = { 'Content-Type': body.type, }

  return new Response(JSON.stringify({ url, method, headers }));
}