import { ParsedSignedUrl } from "@anchan828/nest-storage-common";
import { Test } from "@nestjs/testing";
import { existsSync } from "fs";
import { join } from "path";
import { dirSync, fileSync } from "tmp";
import { StorageModule } from "../storage.module";
import { StorageService } from "../storage.service";
describe("LocalStorage", () => {
  let service: StorageService;
  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket", cacheDir: dirSync().name })],
    }).compile();
    service = app.get<StorageService>(StorageService);
  });

  it("should be defined", () => {
    expect(StorageService).toBeDefined();
    expect(service).toBeDefined();
  });

  const getDest = (filename: string): string => {
    return join(service["options"].cacheDir || "", service["options"].bucket || "", filename);
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

  describe("getSignedUrl", () => {
    it("should be defined", () => {
      expect(service.getSignedUrl).toBeDefined();
    });
    it("should get signed url", async () => {
      await expect(service.getSignedUrl("hoge.txt", { action: "delete" })).resolves.toEqual(expect.any(String));
      await expect(service.getSignedUrl("hoge.txt", { action: "download" })).resolves.toEqual(expect.any(String));
      await expect(service.getSignedUrl("hoge.txt", { action: "upload" })).resolves.toEqual(expect.any(String));
    });

    it("should set signedUrlController property", async () => {
      const app = await Test.createTestingModule({
        imports: [
          StorageModule.register({
            bucket: "bucket",
            cacheDir: dirSync().name,
            signedUrlController: { endpoint: "http://localhost:3000", path: "changedPath", token: "changedToken" },
          }),
        ],
      }).compile();
      service = app.get<StorageService>(StorageService);
      await expect(service.getSignedUrl("hoge.txt", { action: "upload" })).resolves.toEqual(
        expect.stringContaining("http:/localhost:3000/changedPath/bucket/hoge.txt"),
      );
    });
  });

  describe("parseSignedUrl", () => {
    it("should be defined", () => {
      expect(service.getSignedUrl).toBeDefined();
    });
    it("should get signed url", async () => {
      await expect(service.getSignedUrl("hoge.txt", { action: "delete" })).resolves.toEqual(expect.any(String));
      await expect(service.getSignedUrl("hoge.txt", { action: "download" })).resolves.toEqual(expect.any(String));
      await expect(service.getSignedUrl("hoge.txt", { action: "upload" })).resolves.toEqual(expect.any(String));
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
        "Invalid pathname '/_digfe/bucket'. pathname should be '/_signed_url/bucket/path/to/filename.txt'",
      );
    });

    it("should parse signed url", async () => {
      const url = await service.getSignedUrl("path/to/hoge.txt", { action: "upload" });
      expect(service.parseSignedUrl(`http://localhost:3000/${url}`)).toEqual({
        bucket: "bucket",
        filename: "path/to/hoge.txt",
      } as ParsedSignedUrl);
    });
  });
});
