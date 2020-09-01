import type { ParsedSignedUrl, SignedUrlOptions } from "@anchan828/nest-storage-common";
import { AbstractStorage, STORAGE_PROVIDER } from "@anchan828/nest-storage-common";
import type { DynamicModule } from "@nestjs/common";
import { Injectable, Module } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { existsSync } from "fs";
import { dirSync, fileSync } from "tmp";
import { StorageModule } from "./storage.module";
import { StorageService } from "./storage.service";

describe("StorageService", () => {
  @Injectable()
  class CustomStorage extends AbstractStorage {
    public provider = "custom";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async upload(dataPath: string, filename: string): Promise<string> {
      return filename;
    }

    async download(filename: string): Promise<string> {
      return filename;
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
        StorageModule.register({ bucket: "bucket", cacheDir: dirSync().name }, CustomStorageProviderModule.register()),
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
    await service.delete("test.txt");
    await service.download("test.txt");
    await service.exists("test.txt");
    service.parseSignedUrl(await service.getSignedUrl("test.txt", { action: "download" }));
    await service.upload("test.txt", "test.txt");
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
  });
});
