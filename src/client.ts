import type { ClientOptions } from 'minio'
import { Client } from 'minio'
import { defineDriver } from 'unstorage'
import { getKey } from './utils'

export interface S3DriverOptions extends ClientOptions {
  bucket: string
}

const DRIVER_NAME = 's3'

export const s3Driver = defineDriver((options: S3DriverOptions) => {
  let client: Client

  const getClient = () => {
    if (!client) {
      client = new Client(options)
    }

    return client
  }

  return {
    name: DRIVER_NAME,
    options,
    getItem(key) {
      return getClient().getObject(options.bucket, getKey((key)))
    },
    getItemRaw(key) {
      return getClient().getObject(options.bucket, getKey((key)))
    },
    async setItem(key, value) {
      await getClient().putObject(options.bucket, getKey((key)), value)
    },
    async setItemRaw(key, value) {
      await getClient().putObject(options.bucket, getKey((key)), value)
    },
    // getMeta(key) {
    //   return getClient()
    //     .statObject(options.bucket, getKey((key)))
    //     .then((meta) => meta)
    // },
    async hasItem(key) {
      const meta = await getClient().statObject(options.bucket, getKey((key)))
      return !!meta
    },
    async getKeys(base) {
      return await new Promise((resolve, reject) => {
        const objectsListTemp: string[] = []
        const stream = getClient().listObjectsV2(options.bucket, getKey(base), true)

        stream.on('data', (obj) => {
          if (obj.name) {
            objectsListTemp.push(obj.name)
          }
        })
        stream.on('error', reject)
        stream.on('end', () => resolve(objectsListTemp))
      })
    },
    async removeItem(key) {
      return getClient().removeObject(options.bucket, getKey((key)))
    },
  }
})
