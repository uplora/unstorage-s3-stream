import type { Readable } from 'node:stream'
import { Buffer } from 'node:buffer'

/**
 * @see https://github.com/unjs/unstorage/blob/main/src/drivers/utils/index.ts#L14C1-L23C1
 */
export function normalizeKey(key: string | undefined, sep: ':' | '/' = ':'): string {
  if (!key) {
    return ''
  }
  return key.replace(/[:/\\]/g, sep).replace(/^[:/\\]|[:/\\]$/g, '')
}

export function getKey(key: string) {
  return normalizeKey(key, '/')
}

export function streamToBuffer(stream: Readable): Promise<Buffer<ArrayBufferLike>> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []

    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}
