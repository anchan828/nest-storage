import { ParsedSignedUrl } from "@anchan828/nest-storage-common";
import { Test } from "@nestjs/testing";
import axios from "axios";
import { createReadStream, existsSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { dirSync, fileSync, tmpNameSync } from "tmp";
import { CompressFileEntry, StorageModule, StorageService } from "../../storage";
import { GoogleCloudStorageModuleOptions } from "./gcs-storage.interface";
import { GoogleCloudStorage } from "./gcs.storage";

describe("GoogleCloudStorage", () => {
  let service: StorageService;
  let cacheDir: string;
  const bucket = "nestjs-storage";
  beforeEach(async () => {
    cacheDir = dirSync().name;
    const app = await Test.createTestingModule({
      imports: [
        StorageModule.register<GoogleCloudStorageModuleOptions>({
          bucket,
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
    });
  });

  describe("download", () => {
    it("should be defined", () => {
      expect(service.download).toBeDefined();
    });

    it("should download file", async () => {
      await expect(service.upload(fileSync().name, "path/to/test.txt")).resolves.toBe("path/to/test.txt");
      await expect(service.download("path/to/test.txt")).resolves.toBe(join(cacheDir, bucket, "path/to/test.txt"));
    });

    it("should error if file not found", async () => {
      await expect(service.download("path/to/test2.txt")).rejects.toThrowError(
        "No such object: nestjs-storage/path/to/test2.txt",
      );
    });

    it("should get file from cache", async () => {
      await expect(service.upload(fileSync().name, "path/to/test.txt")).resolves.toBe("path/to/test.txt");
      await expect(service.download("path/to/test.txt")).resolves.toBe(join(cacheDir, bucket, "path/to/test.txt"));

      // cache
      await expect(service.download("path/to/test.txt")).resolves.toBe(join(cacheDir, bucket, "path/to/test.txt"));
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

  describe("getSignedUrl", () => {
    it("should be defined", () => {
      expect(service.getSignedUrl).toBeDefined();
    });

    it("should get signed url", async () => {
      await expect(service.getSignedUrl("hoge.txt", { action: "delete" })).resolves.toEqual(expect.any(String));

      await expect(service.getSignedUrl("hoge.txt", { action: "download" })).resolves.toEqual(expect.any(String));

      await expect(service.getSignedUrl("hoge.txt", { action: "upload" })).resolves.toEqual(expect.any(String));
    });

    it("should upload file with signed url", async () => {
      const filename = "path/to/signed-test.txt";
      const contentType = "text/plain";

      const url = await service.getSignedUrl(filename, { action: "upload", contentType });
      await expect(
        axios
          .put(url, Buffer.from("test"), {
            headers: {
              "Content-Type": contentType,
            },
          })
          .then((res) => res.status),
      ).resolves.toBe(200);
    });

    it("should upload file with signed url and readstream", async () => {
      const filename = "path/to/signed-test-with-stream.txt";
      const contentType = "text/plain";
      const expires = 1000 * 60 * 10;

      const url = await service.getSignedUrl(filename, { action: "upload", contentType, expires });
      const tmpFileName = tmpNameSync();
      writeFileSync(tmpFileName, "stream text", "utf8");

      await expect(
        axios
          .put(url, createReadStream(tmpFileName), {
            headers: {
              "Content-Type": contentType,
            },
          })
          .then((res) => res.status),
      ).resolves.toBe(200);
    });
  });
  describe("exists", () => {
    it("should be defined", () => {
      expect(service.exists).toBeDefined();
    });

    it("should return false", async () => {
      await expect(service.exists("not-exists.txt")).resolves.toBeFalsy();
    });

    it("should delete file", async () => {
      await service.upload(fileSync().name, "test.txt");
      await expect(service.exists("test.txt")).resolves.toBeTruthy();
    });
  });

  describe("parseSignedUrl", () => {
    it("should be defined", () => {
      expect(service.parseSignedUrl).toBeDefined();
    });
    it("should throw error if invalid host", () => {
      expect(() => {
        service.parseSignedUrl("https://invalid.googleapis.com/nestjs-storage/path/to/hoge.txt");
      }).toThrowError("Invalid endopint 'invalid.googleapis.com'. endpoint should be https://storage.googleapis.com");
    });

    it("should throw error if invalid pathname", () => {
      expect(() => {
        service.parseSignedUrl("https://storage.googleapis.com/");
      }).toThrowError("Invalid pathname '/'. pathname should be '/bucket/path/to/filename.txt'");

      expect(() => {
        service.parseSignedUrl("https://storage.googleapis.com");
      }).toThrowError("Invalid pathname '/'. pathname should be '/bucket/path/to/filename.txt'");

      expect(() => {
        service.parseSignedUrl("https://storage.googleapis.com/test");
      }).toThrowError("Invalid pathname '/test'. pathname should be '/bucket/path/to/filename.txt'");

      expect(() => {
        service.parseSignedUrl("https://storage.googleapis.com/test/");
      }).toThrowError("Invalid filename. filename was empty");
    });

    it("should parse signed url", () => {
      expect(service.parseSignedUrl("https://storage.googleapis.com/nestjs-storage/path/to/hoge.txt")).toEqual({
        bucket: "nestjs-storage",
        filename: "path/to/hoge.txt",
      } as ParsedSignedUrl);
    });
  });

  describe("compress", () => {
    it("should be defined", () => {
      expect(service.compress).toBeDefined();
    });

    it("should create compressed files", async () => {
      const file1 = await service.upload(fileSync().name, "test1.txt");
      const file2 = await service.upload(fileSync().name, "dir/test2.txt");
      const file3 = await service.upload(fileSync().name, "dir/to/test3.txt");
      const file4 = await service.upload(fileSync().name, "test4.txt");
      const file4Entry = { filename: file4, relativePath: "dir/test5.txt" } as CompressFileEntry;
      const zip = await service.compress([file1, file2, file3, file4Entry]);
      const tar = await service.compress([file1, file2, file3, file4Entry], { compressType: "tar" });
      const tgz = await service.compress([file1, file2, file3, file4Entry], { compressType: "tgz" });
      expect(existsSync(zip)).toBeTruthy();
      expect(existsSync(tar)).toBeTruthy();
      expect(existsSync(tgz)).toBeTruthy();
    });
  });
});
