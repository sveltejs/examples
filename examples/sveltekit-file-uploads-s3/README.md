# SvelteKit file uploads using S3

This example demonstrates how you can upload files with SvelteKit in two different ways to an S3 compatible storage provider such as Cloudflare R2, DigitalOcean Spaces, AWS S3 etc.

## Form 1: Small files

The first form first sends the file as `FormData` to the SvelteKit server and from there uploads it to S3.

- It works with and without JavaScript
- It uses FormData and SvelteKit's form actions
- It should only be used for small files such as avatar images because the whole file first needs to be parsed in memory with `event.request.formData()` and there is no upload progress indicator.

## Form 2: Small and large files

The second form for both small and large files generates a presigned URL on the server that the client then uses to directly upload the file to an S3 provider from the frontend.

- JavaScript is required for this to work
- A custom store handles all the requests and calculates the upload progress
- `src/routes/presigned-url/+server.js` generates the upload URL
- `XMLHTTPRequest` is used to make the requests because `fetch` cannot be used (yet) to calculate the upload progress

To try out this example you can create a `.env` file in the project root with the following environment variables and run `pnpm i && pnpm dev`

```
S3_REGION='<region>'
S3_BUCKET='<S3 bucket name>'
S3_ENDPOINT='<S3 API URL>'
S3_ACCESS_KEY_ID='<Your S3 access key ID>'
S3_SECRET_ACCESS_KEY='<Your S3 secret access id>'
S3_PUBLIC_BUCKET_URL='<Public S3 bucket URL>'
```
