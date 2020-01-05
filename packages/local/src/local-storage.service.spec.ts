import { Test } from "@nestjs/testing";
import { existsSync } from "fs";
import { dirSync, fileSync } from "tmp";
import { LocalStorageModule } from "./local-storage.module";
import { LocalStorageService } from "./local-storage.service";
describe("LocalStorageService", () => {
  let service: LocalStorageService;
  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [LocalStorageModule.register({ bucket: "bucket", dir: dirSync().name })],
    }).compile();
    service = app.get<LocalStorageService>(LocalStorageService);
  });

  it("should be defined", () => {
    expect(LocalStorageService).toBeDefined();
    expect(service).toBeDefined();
  });

  describe("upload", () => {
    it("should be defined", () => {
      expect(service.upload).toBeDefined();
    });

    it("should upload to dir", async () => {
      let dest = await service.upload(fileSync().name, "path/to/test.txt");
      expect(existsSync(dest)).toBeTruthy();

      dest = await service.upload(fileSync().name, "path/to/test2.txt");
      expect(existsSync(dest)).toBeTruthy();
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
      const dest = await service.upload(fileSync().name, "test.txt");
      await expect(service.download("test.txt")).resolves.toBe(dest);
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
      const dest = await service.upload(fileSync().name, "test.txt");
      expect(existsSync(dest)).toBeTruthy();

      await service.delete("test.txt");

      expect(existsSync(dest)).toBeFalsy();
    });
  });
});
