import { Test } from "@nestjs/testing";
import { basename, join } from "path";
import { dirSync, fileSync } from "tmp";
import { StorageModule, StorageService } from "../../storage";
import { S3StorageModuleOptions, S3StorageUploadOptions } from "./s3-storage.interface";
import { S3Storage } from "./s3.storage";
describe("S3Storage", () => {
  let service: StorageService;
  let cacheDir: string;

  beforeEach(async () => {
    cacheDir = dirSync().name;
    const app = await Test.createTestingModule({
      imports: [
        StorageModule.register<S3StorageModuleOptions>({
          accessKeyId: process.env.NEST_STORAGE_S3_KEY,
          bucket: "nestjs-storage",
          cacheDir,
          secretAccessKey: process.env.NEST_STORAGE_S3_SECRET_KEY,
          storage: S3Storage,
        }),
      ],
    }).compile();
    service = app.get<StorageService>(StorageService);
  });

  it("should be defined", () => {
    expect(S3Storage).toBeDefined();
    expect(service).toBeDefined();
  });

  describe("upload", () => {
    it("should be defined", () => {
      expect(service.upload).toBeDefined();
    });

    it("should upload to s3", async () => {
      await expect(service.upload(fileSync().name, "path/to/test.txt")).resolves.toBe("path/to/test.txt");
      await expect(
        service.upload<S3StorageUploadOptions>(fileSync().name, "path/to/test.txt", { Expires: new Date("2020-2-1") }),
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
      await expect(service.download("path/to/test2.txt")).rejects.toThrowError("The specified key does not exist.");
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
      const srcFilename = fileSync().name;
      const destFilename = `path/to/${basename(srcFilename)}.txt`;
      await expect(service.upload(srcFilename, destFilename)).resolves.toBe(destFilename);
      await expect(service.delete(destFilename)).resolves.toBeUndefined();
    });
  });
});
