# SvelteKit file uploads with Node.js

This example demonstrates how you can handle file uploads with SvelteKit and an S3 compatible service such as Cloudflare R2, DigitalOcean Spaces, AWS S3 etc. in two different ways. The first form first sends the file as `FormData` to the SvelteKit server and from there uploads it to S3. The second form for large files generates a presigned URL on the server that the client then uses to directly upload the file to S3 withough the file first having to go through the SvelteKit server.

## Form 1: Small file uploads
Key things to know are:
- Works with and without JavaScript
- Uses FormData and SvelteKit's form actions
- Should only be used for small files such as avatar images because there is no progress indicator and the file first needs parsing the whole body with `event.request.formData()`

## Form 2: Large file uploads
Key things to know are:
- JavaScript is required for this to work
- The upload logic is encapsulated in a custom store
- `src/routes/presigned-url/+server.js` generates the upload URL
- `XMLHTTPRequest` is used to upload the file because `fetch` cannot be used (yet) to calculate the upload progress

To try out this example in development you can create a `.env` file in the project root with the following environment variables and run `pnpm i && pnpm dev`
```
S3_REGION='<region>'
S3_BUCKET='<S3 bucket name>'
S3_ENDPOINT='<S3 API URL>'
S3_ACCESS_KEY_ID='<Your S3 access key ID>'
S3_SECRET_ACCESS_KEY='<Your S3 secret access id>'
PUBLIC_S3_BUCKET_URL='<Public S3 bucket URL>'
```