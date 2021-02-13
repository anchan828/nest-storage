import { readFile, writeFile } from "fs";
import * as Redis from "ioredis";
import { promisify } from "util";
import type { StorageRedisOptions } from "./interfaces";

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
export class RedisService {
  #client: Redis.Redis;

  constructor(private readonly options: StorageRedisOptions) {
    this.#client = new Redis(options.options);
    this.options.prefixKey = this.options.prefixKey ?? "storage-cache";
  }

  public async upload(dataPath: string, destination: string): Promise<void> {
    const key = `${this.options.prefixKey}:${destination}`;
    const value = await readFileAsync(dataPath);
    await this.#client.setBuffer(key, value);
    if (this.options.ttl) {
      await this.#client.expire(key, this.options.ttl);
    }
  }

  /**
   * Returns true if download data from redis
   *
   * @param {string} destination
   * @return {*}  {Promise<boolean>}
   * @memberof RedisService
   */
  public async download(destination: string): Promise<boolean> {
    const key = `${this.options.prefixKey}:${destination}`;
    const exists = await this.#client.exists(key);

    if (exists === 1) {
      const data = await this.#client.getBuffer(key);
      await writeFileAsync(destination, data);
    }

    return exists === 1;
  }

  public async quit(): Promise<void> {
    await this.#client.quit();
  }
}
