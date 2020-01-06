import { Test } from "@nestjs/testing";
import { join } from "path";
import { dirSync, fileSync } from "tmp";
import { StorageModule, StorageService } from "../../storage";
import { GoogleCloudStorageModuleOptions, GoogleCloudStorageUploadOptions } from "./gcs-storage.interface";
import { GoogleCloudStorage } from "./gcs.storage";
describe("GoogleCloudStorage", () => {
  let service: StorageService;
  let cacheDir: string;
  beforeEach(async () => {
    cacheDir = dirSync().name;
    const app = await Test.createTestingModule({
      imports: [
        StorageModule.register<GoogleCloudStorageModuleOptions>({
          bucket: "nestjs-storage",
          cacheDir,
          keyFilename: process.env.NEST_STORAGE_GCS_KEY,
          storage: GoogleCloudStorage,
        }),
      ],
    }).compile();
    service = app.get<StorageService>(StorageService);
  });

  it("should be defined", () => {
    expect(GoogleCloudStorage).toBeDefined();
    expect(service).toBeDefined();
  });

  describe("upload", () => {
    it("should be defined", () => {
      expect(service.upload).toBeDefined();
    });

    it("should upload to gcs", async () => {
      await expect(service.upload(fileSync().name, "path/to/test.txt")).resolves.toBe("path/to/test.txt");
      await expect(
        service.upload<GoogleCloudStorageUploadOptions>(fileSync().name, "path/to/test.txt", { gzip: true }),
      ).resolves.toBe("path/to/test.txt");
    });
  });

  describe("download", () => {
    it("should be defined", () => {
      expect(service.download).toBeDefined();
    });

    it("should download file", async () => {
      await expect(service.upload(fileSync().name, "path/to/test.txt")).resolves.toBe("path/to/test.txt");
      await expect(service.download("path/to/test.txt")).resolves.toBe(join(cacheDir, "path/to/test.txt"));
    });

    it("should error if file not found", async () => {
      await expect(service.upload(fileSync().name, "path/to/test.txt")).resolves.toBe("path/to/test.txt");
      await expect(service.download("path/to/test2.txt")).rejects.toThrowError(
        "No such object: nestjs-storage/path/to/test2.txt",
      );
    });

    it("should get file from cache", async () => {
      await expect(service.upload(fileSync().name, "path/to/test.txt")).resolves.toBe("path/to/test.txt");
      await expect(service.download("path/to/test.txt")).resolves.toBe(join(cacheDir, "path/to/test.txt"));

      // cache
      await expect(service.download("path/to/test.txt")).resolves.toBe(join(cacheDir, "path/to/test.txt"));
    });
  });

  describe("delete", () => {
    it("should be defined", () => {
      expect(service.delete).toBeDefined();
    });

    it("should delete file", async () => {
      await expect(service.upload(fileSync().name, "path/to/delete-test.txt")).resolves.toBe("path/to/delete-test.txt");
      await expect(service.delete("path/to/delete-test.txt")).resolves.toBeUndefined();
    });
  });
});
