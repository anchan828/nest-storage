import type { ParsedSignedUrl, SignedUrlOptions } from "@anchan828/nest-storage-common";
import {
  AbstractStorage,
  StorageCoreModuleOptions,
  STORAGE_MODULE_OPTIONS,
  STORAGE_PROVIDER,
} from "@anchan828/nest-storage-common";
import type { DynamicModule } from "@nestjs/common";
import { Global, Inject, Injectable, Module } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { existsSync, writeFileSync } from "fs";
import * as Redis from "ioredis";
import { join } from "path";
import { dirSync, fileSync, tmpNameSync } from "tmp";
import { StorageModule } from "./storage.module";
import { StorageService } from "./storage.service";

describe("StorageService", () => {
  @Injectable()
  class CustomStorage extends AbstractStorage {
    public provider = "custom";

    constructor(@Inject(STORAGE_MODULE_OPTIONS) protected readonly storageOptions: StorageCoreModuleOptions) {
      super(storageOptions);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async upload(dataPath: string, filename: string): Promise<string> {
      return filename;
    }

    async download(filename: string): Promise<string> {
      return await this.getDestinationCachePath(filename, this.storageOptions);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    async delete(filename: string): Promise<void> {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async exists(filename: string): Promise<boolean> {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string> {
      return filename;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    parseSignedUrl(url: string): ParsedSignedUrl {
      return {} as ParsedSignedUrl;
    }
  }

  @Module({})
  @Global()
  class CustomStorageProviderModule {
    public static register(): DynamicModule {
      return {
        exports: [{ provide: STORAGE_PROVIDER, useClass: CustomStorage }],
        module: CustomStorageProviderModule,
        providers: [{ provide: STORAGE_PROVIDER, useClass: CustomStorage }],
      };
    }
  }
  let app: TestingModule;
  let service: StorageService;
  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        StorageModule.register({ bucket: "bucket", cacheDir: dirSync().name, redis: { options: {}, ttl: 30 } }),
        CustomStorageProviderModule.register(),
      ],
    }).compile();
    service = app.get<StorageService>(StorageService);
  });
  afterEach(async () => {
    await app.close();
  });
  it("should create custom storage provider", async () => {
    expect(service["storage"]).toBeInstanceOf(CustomStorage);
  });

  it("should call methods", async () => {
    const dataPath = join(dirSync().name, "test.txt");
    writeFileSync(dataPath, "test");
    await service.upload(dataPath, "test.txt");
    await service.upload(dataPath, "test.txt", { disableRedisCaching: true });
    await service.exists("test.txt");
    await service.download("test.txt");
    await service.download("test.txt", { disableRedisCaching: true });

    const redis = new Redis();
    await redis.del(...(await redis.keys("*")));
    await redis.quit();

    await service.download("test.txt");
    service.parseSignedUrl(await service.getSignedUrl("test.txt", { action: "download" }));
    await service.delete("test.txt");
  });

  it("should call compress", async () => {
    // zip
    let dest = await service.compress([fileSync().name, fileSync().name, fileSync().name]);
    expect(existsSync(dest)).toBeTruthy();

    // tar
    dest = await service.compress([fileSync().name, fileSync().name, fileSync().name], { compressType: "tar" });
    expect(existsSync(dest)).toBeTruthy();

    // tgz
    dest = await service.compress([fileSync().name, fileSync().name, fileSync().name], { compressType: "tgz" });
    expect(existsSync(dest)).toBeTruthy();

    // use destination
    dest = await service.compress([fileSync().name, fileSync().name, fileSync().name], {
      destination: tmpNameSync({ postfix: ".zip" }),
    });

    expect(existsSync(dest)).toBeTruthy();

    // throw error if unsupported extension
    await expect(
      service.compress([fileSync().name, fileSync().name, fileSync().name], {
        destination: tmpNameSync({ postfix: ".png" }),
      }),
    ).rejects.toThrowError("The destination has unsupported extension. Please use .zip/.tar/.tar.gz instead of .png");
  });

  describe("getSignedUrl", () => {
    it("no cache", async () => {
      await expect(service.getSignedUrl("filename", { action: "download" })).resolves.toEqual("filename");
    });

    it("use cache", async () => {
      const cache = new Map<string, string>();
      await expect(
        service.getSignedUrl("filename", {
          action: "download",
          cache: {
            getCache: async (key: string) => {
              return cache.get(key);
            },
            setCache: async (key: string, value: string) => {
              cache.set(key, value);
            },
          },
        }),
      ).resolves.toEqual("filename");

      await expect(
        service.getSignedUrl("filename", {
          action: "download",
          cache: {
            getCache: async (key: string) => {
              return cache.get(key);
            },
            setCache: async (key: string, value: string) => {
              cache.set(key, value);
            },
          },
        }),
      ).resolves.toEqual("filename");

      expect([...cache.entries()]).toEqual([["__signed-url-caches:filename", "filename"]]);
    });
  });
});
