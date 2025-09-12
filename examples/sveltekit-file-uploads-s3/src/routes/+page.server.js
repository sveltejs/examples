import { fail } from '@sveltejs/kit';
import { S3 } from '$lib/s3.server.js';
import { env } from '$env/dynamic/private';
import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const bucket = await S3.send(new ListObjectsV2Command({ Bucket: env.S3_BUCKET }));

	return { files: bucket.Contents ?? [] };
}

/** @type {import('./$types').Actions} */
export const actions = {
	async upload(event) {
		const data = await event.request.formData();

		const file = /** @type {File} */ (data.get('file'));

		if (file instanceof File === false || file.size === 0) {
			return fail(400);
		}

		try {
			return await S3.send(
				new PutObjectCommand({
					Bucket: env.S3_BUCKET,
					Key: file.name,
					Body: /** @type {Buffer} */ (await file.arrayBuffer())
				})
			);
		} catch (err) {
			return fail(500);
		}
	},
	async delete(event) {
		const data = await event.request.formData();

		const key = data.get('key');

		if (typeof key !== 'string') {
			return fail(400);
		}

		try {
			return await S3.send(
				new DeleteObjectCommand({
					Bucket: env.S3_BUCKET,
					Key: key
				})
			);
		} catch (err) {
			return fail(500);
		}
	}
};
