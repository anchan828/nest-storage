import { CommonStorageService, StorageModuleOptions, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { Test, TestingModule } from "@nestjs/testing";
import { dirSync } from "tmp";
import { LocalStorage } from "./local.storage";
import { StorageModule } from "./storage.module";
import { StorageService } from "./storage.service";

describe("LocalStorageModule", () => {
  const shouldGetProviders = (app: TestingModule): void => {
    expect(app.get<StorageModuleOptions>(STORAGE_MODULE_OPTIONS)).toBeDefined();
    expect(app.get<CommonStorageService>(CommonStorageService)).toBeDefined();
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
          storage: LocalStorage,
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
              storage: LocalStorage,
            };
          },
        }),
      ],
    }).compile();
    shouldGetProviders(app);
  });
});
