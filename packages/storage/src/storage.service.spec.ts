import { AbstractStorage, ParsedSignedUrl, SignedUrlOptions, STORAGE_PROVIDER } from "@anchan828/nest-storage-common";
import { DynamicModule, Injectable, Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { dirSync } from "tmp";
import { StorageModule } from "./storage.module";
import { StorageService } from "./storage.service";

describe("StorageService", () => {
  it("should create custom storage provider", async () => {
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

    const app = await Test.createTestingModule({
      imports: [
        StorageModule.register({ bucket: "bucket", cacheDir: dirSync().name }, CustomStorageProviderModule.register()),
      ],
    }).compile();
    const service = app.get<StorageService>(StorageService);
    expect(service["storage"]).toBeInstanceOf(CustomStorage);
  });
});
