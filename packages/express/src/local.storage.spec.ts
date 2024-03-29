import type { ParsedSignedUrl } from "@anchan828/nest-storage-common";
import { Test } from "@nestjs/testing";
import { existsSync } from "fs";
import { join } from "path";
import { dirSync, fileSync } from "tmp";
import type { CompressFileEntry } from "../../storage/src/interfaces";
import { StorageModule } from "../../storage/src/storage.module";
import { StorageService } from "../../storage/src/storage.service";
import { LocalStorageProviderModule } from "./local.module";
describe("LocalStorage", () => {
  let service: StorageService;
  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [
        StorageModule.register({ bucket: "bucket", cacheDir: dirSync().name }),
        LocalStorageProviderModule.register({ signedUrlOptions: { endpoint: "http://localhost:3000" } }),
      ],
    }).compile();
    service = app.get<StorageService>(StorageService);
  });

  it("should be defined", () => {
    expect(StorageService).toBeDefined();
    expect(service).toBeDefined();
  });

  const getDest = (filename: string): string => {
    return join(
      service["storage"]["storageOptions"].cacheDir || "",
      service["storage"]["storageOptions"].bucket || "",
      filename,
    );
  };

  describe("upload", () => {
    it("should be defined", () => {
      expect(service.upload).toBeDefined();
    });

    it("should upload to cacheDir", async () => {
      await expect(service.upload(fileSync().name, "path/to/test.txt")).resolves.toBe("path/to/test.txt");
      await expect(service.upload(fileSync().name, "path/to/test2.txt")).resolves.toBe("path/to/test2.txt");
      expect(existsSync(getDest("path/to/test.txt"))).toBeTruthy();
      expect(existsSync(getDest("path/to/test2.txt"))).toBeTruthy();
    });
  });

  describe("download", () => {
    it("should be defined", () => {
      expect(service.download).toBeDefined();
    });

    it("should throw error if file not found", async () => {
      await expect(service.download("test.txt")).rejects.toThrowError(
        'File not found: {"bucket":"bucket","filename":"test.txt"}',
      );
    });

    it("should return dest", async () => {
      const filename = await service.upload(fileSync().name, "test.txt");
      await expect(service.download("test.txt")).resolves.toBe(getDest(filename));
    });
  });

  describe("delete", () => {
    it("should be defined", () => {
      expect(service.delete).toBeDefined();
    });

    it("should throw error if file not found", async () => {
      await expect(service.delete("test.txt")).rejects.toThrowError(
        'File not found: {"bucket":"bucket","filename":"test.txt"}',
      );
    });

    it("should delete file", async () => {
      const filename = await service.upload(fileSync().name, "test.txt");
      expect(existsSync(getDest(filename))).toBeTruthy();

      await service.delete("test.txt");

      expect(existsSync(getDest(filename))).toBeFalsy();
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

  describe("copy", () => {
    it("should be defined", () => {
      expect(service.copy).toBeDefined();
    });

    it("should copy file", async () => {
      const srcFilename = await service.upload(fileSync().name, "path/to/test.txt");
      const destFilename = "path/to/copy/test.txt";

      await expect(service.copy(srcFilename, destFilename)).resolves.toBeUndefined();
      await expect(service.exists("path/to/copy/test.txt")).resolves.toBeTruthy();
    });

    it("should copy file between bucket", async () => {
      const srcFilename = await service.upload(fileSync().name, "path/to/test.txt", { bucket: "hogehoge" });
      const destFilename = "path/to/copy/test.txt";

      await expect(
        service.copy(srcFilename, destFilename, { bucket: "hogehoge" }, { bucket: "fugafuga" }),
      ).resolves.toBeUndefined();
      await expect(service.exists("path/to/copy/test.txt", { bucket: "fugafuga" })).resolves.toBeTruthy();
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

    it("should set signedUrlOptions property", async () => {
      const app = await Test.createTestingModule({
        imports: [
          StorageModule.register({
            bucket: "bucket",
            cacheDir: dirSync().name,
          }),
          LocalStorageProviderModule.register({
            signedUrlOptions: { endpoint: "http://localhost:3000", path: "changedPath", token: "changedToken" },
          }),
        ],
      }).compile();
      await expect(
        app.get<StorageService>(StorageService).getSignedUrl("hoge.txt", { action: "upload" }),
      ).resolves.toEqual(expect.stringContaining("http://localhost:3000/changedPath/bucket/hoge.txt"));
    });

    it("should set signedUrlOptions property", async () => {
      const app = await Test.createTestingModule({
        imports: [
          StorageModule.register({
            bucket: "bucket",
            cacheDir: dirSync().name,
          }),
          LocalStorageProviderModule.register({
            signedUrlOptions: {
              endpoint: "http://localhost:3000/storage",
            },
          }),
        ],
      }).compile();
      await expect(
        app.get<StorageService>(StorageService).getSignedUrl("hoge.txt", { action: "upload" }),
      ).resolves.toEqual(expect.stringContaining("http://localhost:3000/storage/_signed_url/bucket/hoge.txt"));
    });
  });

  describe("parseSignedUrl", () => {
    it("should be defined", () => {
      expect(service.parseSignedUrl).toBeDefined();
    });

    it("should throw error", () => {
      expect(() => {
        service.parseSignedUrl("http://localhost:3000/_digfe/bucket");
      }).toThrowError(
        "Invalid pathname '/_digfe/bucket'. pathname should be '_signed_url/bucket/path/to/filename.txt'",
      );
    });

    it("should parse signed url", async () => {
      const url = await service.getSignedUrl("path/to/hoge.txt", { action: "upload" });
      expect(service.parseSignedUrl(url)).toEqual({
        bucket: "bucket",
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
