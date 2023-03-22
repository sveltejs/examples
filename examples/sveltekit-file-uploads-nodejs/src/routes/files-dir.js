import { env } from '$env/dynamic/private';

export const FILES_DIR = env.FILES_DIR ?? '.temp-files';
