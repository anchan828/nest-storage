import { CommonStorageService, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { Test, TestingModule } from "@nestjs/testing";
import { dirSync } from "tmp";
import { LocalStorageModuleOptions } from ".";
import { LocalStorageModule } from "./local-storage.module";
import { LocalStorageService } from "./local-storage.service";

describe("LocalStorageModule", () => {
  const shouldGetProviders = (app: TestingModule): void => {
    expect(app.get<LocalStorageModuleOptions>(STORAGE_MODULE_OPTIONS)).toBeDefined();
    expect(app.get<CommonStorageService>(CommonStorageService)).toBeDefined();
    expect(app.get<LocalStorageService>(LocalStorageService)).toBeDefined();
  };

  it("should be defined", () => {
    expect(LocalStorageModule).toBeDefined();
  });

  it("should compile register", async () => {
    const app = await Test.createTestingModule({
      imports: [LocalStorageModule.register({ dir: dirSync().name })],
    }).compile();
    shouldGetProviders(app);
  });

  it("should compile registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        LocalStorageModule.registerAsync({
          useFactory: () => {
            return { dir: dirSync().name };
          },
        }),
      ],
    }).compile();
    shouldGetProviders(app);
  });
});
