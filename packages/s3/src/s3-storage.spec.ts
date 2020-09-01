import { Test } from "@nestjs/testing";
import axios from "axios";
import { createReadStream, existsSync, statSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { dirSync, fileSync, tmpNameSync } from "tmp";
import { StorageModule, StorageService } from "../../storage";
import { S3ProviderModule } from "./s3.module";
import { S3Storage } from "./s3.storage";
describe("S3Storage", () => {
  let service: StorageService;
  let cacheDir: string;
  const bucket = "nestjs-storage";
  beforeEach(async () => {
    cacheDir = dirSync().name;
    const app = await Test.createTestingModule({
      imports: [
        StorageModule.register(
          {
            bucket,
            cacheDir,
          },
          S3ProviderModule.register({
            accessKeyId: process.env.NEST_STORAGE_S3_KEY,
            region: "ap-northeast-1",
            secretAccessKey: process.env.NEST_STORAGE_S3_SECRET_KEY,
          }),
        ),
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
      await expect(service.download("path/to/test2.txt")).rejects.toThrowError("The specified key does not exist.");
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

  describe("getSignedUrl", () => {
    it("should be defined", () => {
      expect(service.getSignedUrl).toBeDefined();
    });

    it("should get signed url", async () => {
      await expect(service.getSignedUrl("hoge.txt", { action: "upload", expires: 90000 })).resolves.toEqual(
        expect.any(String),
      );
      await expect(service.getSignedUrl("hoge.txt", { action: "download" })).resolves.toEqual(expect.any(String));
      await expect(service.getSignedUrl("hoge.txt", { action: "delete" })).resolves.toEqual(expect.any(String));
    });

    it("should upload file with signed url", async () => {
      const filename = "path/to/signed-test.txt";
      const contentType = "text/plain";

      const url = await service.getSignedUrl(filename, { action: "upload" });
      await expect(
        axios.put(url, Buffer.from("test"), { headers: { "Content-Type": contentType } }).then((res) => res.status),
      ).resolves.toBe(200);
    });
    it("should upload file with signed url and readstream", async () => {
      const filename = "path/to/signed-test-with-stream.txt";
      const contentType = "text/plain";

      const url = await service.getSignedUrl(filename, { action: "upload" });
      const tmpFileName = tmpNameSync();
      writeFileSync(tmpFileName, "stream text", "utf8");

      await expect(
        axios
          .put(url, createReadStream(tmpFileName), {
            headers: { "Content-Length": statSync(tmpFileName).size, "Content-Type": contentType },
          })
          .then((res) => res.status),
      ).resolves.toBe(200);
    });
  });

  describe("parseSignedUrl", () => {
    it("should be defined", () => {
      expect(service.parseSignedUrl).toBeDefined();
    });
    it("should throw error if invalid host", () => {
      expect(service.parseSignedUrl("https://s3.amazonaws.com/nestjs-storage/path/to/hoge.txt")).toStrictEqual({
        bucket: "nestjs-storage",
        filename: "path/to/hoge.txt",
      });
      expect(service.parseSignedUrl("https://nestjs-storage.s3.ap-northeast-1.amazonaws.com/hoge.txt")).toStrictEqual({
        bucket: "nestjs-storage",
        filename: "hoge.txt",
      });
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
      const file4Entry = { filename: file4, relativePath: "dir/test5.txt" };
      const zip = await service.compress([file1, file2, file3, file4Entry]);
      const tar = await service.compress([file1, file2, file3, file4Entry], { compressType: "tar" });
      const tgz = await service.compress([file1, file2, file3, file4Entry], { compressType: "tgz" });
      expect(existsSync(zip)).toBeTruthy();
      expect(existsSync(tar)).toBeTruthy();
      expect(existsSync(tgz)).toBeTruthy();
    });
  });
});
