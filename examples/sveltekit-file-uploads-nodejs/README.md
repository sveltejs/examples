# SvelteKit file uploads with Node.js

This example demonstrates how you can handle file uploads with SvelteKit and Node.js in two different ways. Both forms write files to the local disk. Uploaded files are served through the `src/routes/files/+server.js` endpoint.

## Small file uploads
Key things to consider are:
- Works with and without JavaScript
- Uses FormData and SvelteKit's form actions
- Should only be used for small files such as avatar images because there is no progress indicator and writing the file to disk requires first parsing the whole body with `event.request.formData()`

## Large file uploads
Key things to consider are:
- JavaScript is required for this to work
- The upload logic is encapsulated in a custom store
- `XMLHTTPRequest` is used  because `fetch` cannot be used (yet) to calculate the upload progress
- The file object from the file input element is used as the body
- Additional information such as the file name is passed to the server using custom headers such as `x-file-name`
- If a file was already uploaded before the endpoint closes the connection by calling `event.body.cancel()`

**Note:** This example makes use of the  `Readable.fromWeb()` API to convert between web streams and Node.js streams so Node.js >= 17.0.0 is required.