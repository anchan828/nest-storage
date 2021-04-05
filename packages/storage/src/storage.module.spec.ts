import type { StorageCoreModuleOptions } from "@anchan828/nest-storage-common";
import {
  STORAGE_MODULE_OPTIONS,
  STORAGE_PROVIDER,
  STORAGE_PROVIDER_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { dirSync } from "tmp";
import { LocalStorageProviderModule } from "../../express/src";
import { StorageModule } from "./storage.module";
import { StorageService } from "./storage.service";

describe("LocalStorageProviderModule", () => {
  const shouldGetProviders = (app: TestingModule): void => {
    expect(app.get<StorageCoreModuleOptions>(STORAGE_MODULE_OPTIONS)).toBeDefined();
    expect(app.get<StorageCoreModuleOptions>(STORAGE_PROVIDER_MODULE_OPTIONS)).toBeDefined();
    expect(app.get<StorageCoreModuleOptions>(STORAGE_PROVIDER)).toBeDefined();
    expect(app.get<StorageService>(StorageService)).toBeDefined();
  };

  it("should be defined", () => {
    expect(StorageModule).toBeDefined();
  });

  it("should compile register", async () => {
    const app = await Test.createTestingModule({
      imports: [
        StorageModule.register({
          cacheDir: dirSync().name,
        }),
        LocalStorageProviderModule.register(),
      ],
    }).compile();
    shouldGetProviders(app);
  });

  it("should compile register with signedUrlController", async () => {
    const app = await Test.createTestingModule({
      imports: [
        StorageModule.register({
          cacheDir: dirSync().name,
        }),
        LocalStorageProviderModule.register({
          signedUrlController: {
            endpoint: "http://localhost:3000",
            path: "changed",
            token: "change token",
          },
        }),
      ],
    }).compile();
    shouldGetProviders(app);
  });

  it("should compile registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        StorageModule.registerAsync({
          useFactory: () => {
            return {
              cacheDir: dirSync().name,
            };
          },
        }),
        LocalStorageProviderModule.registerAsync({
          useFactory: () => {
            return {
              signedUrlController: {
                endpoint: "http://localhost:3000",
                path: "changed",
                token: "change token",
              },
            };
          },
        }),
      ],
    }).compile();
    shouldGetProviders(app);
  });
  it("should compile registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        StorageModule.registerAsync({
          useFactory: () => {
            return {
              cacheDir: dirSync().name,
            };
          },
        }),
        LocalStorageProviderModule.registerAsync({
          useFactory: () => {
            return {
              signedUrlController: {
                endpoint: "http://localhost:3000",
                path: "changed",
                token: "change token",
              },
            };
          },
        }),
      ],
    }).compile();
    shouldGetProviders(app);
  });
});
