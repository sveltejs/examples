# SvelteKit file uploads using Node.js

This example demonstrates how you can upload files with SvelteKit and Node.js in two different ways.

**Note:** This code makes use of the `Readable.fromWeb()` API to convert between web streams and Node.js streams so Node.js >= 17.0.0 is required.

Both forms write files to the local disk into a directory specified by the `FILES_DIR` environment variable. Uploaded files are served through the `src/routes/files/[name]/+server.js` endpoint.

## Form 1: Small files

This first form sends the file as `FormData` to the SvelteKit server.

- It works with and without JavaScript
- It uses FormData and SvelteKit's form actions
- It should only be used for small files such as avatar images because the whole file first needs to be parsed in memory with `event.request.formData()` and there is no upload progress indicator.

## Form 2: Small and large files

The second form for both small and large files uses a custom store and posts the raw file body to the `upload/+server.js` endpoint.

- JavaScript is required for this to work
- A custom store handles the request and calculates the upload progress
- `XMLHTTPRequest` is used to make the requests because `fetch` cannot be used (yet) to calculate the upload progress
- The file object from the file input element is used as the body of the request
- Additional information such as the file's name is passed to the server using custom request headers such as `x-file-name`
- If a file with the same name has already been uploaded before the endpoint closes the connection by calling `event.body.cancel()`
