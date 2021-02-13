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

  public async download(destination: string): Promise<void> {
    const key = `${this.options.prefixKey}:${destination}`;
    const exists = await this.#client.exists(key);

    if (exists) {
      const data = await this.#client.getBuffer(key);
      await writeFileAsync(destination, data);
    }
  }

  public async quit(): Promise<void> {
    await this.#client.quit();
  }
}
