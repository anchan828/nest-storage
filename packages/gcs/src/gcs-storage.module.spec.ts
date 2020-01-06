import { CommonStorageService, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { Test, TestingModule } from "@nestjs/testing";
import { GoogleCloudStorageModuleOptions } from "./gcs-storage.interface";
import { GoogleCloudStorageModule } from "./gcs-storage.module";
import { GoogleCloudStorageService } from "./gcs-storage.service";

describe("GoogleCloudStorageModule", () => {
  const shouldGetProviders = (app: TestingModule): void => {
    expect(app.get<GoogleCloudStorageModuleOptions>(STORAGE_MODULE_OPTIONS)).toBeDefined();
    expect(app.get<CommonStorageService>(CommonStorageService)).toBeDefined();
    expect(app.get<GoogleCloudStorageService>(GoogleCloudStorageService)).toBeDefined();
  };

  it("should be defined", () => {
    expect(GoogleCloudStorageModule).toBeDefined();
  });

  it("should compile register", async () => {
    const app = await Test.createTestingModule({
      imports: [GoogleCloudStorageModule.register({ bucket: "bucket" })],
    }).compile();
    shouldGetProviders(app);
  });

  it("should compile registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        GoogleCloudStorageModule.registerAsync({
          useFactory: () => {
            return { bucket: "bucket" };
          },
        }),
      ],
    }).compile();
    shouldGetProviders(app);
  });
});
