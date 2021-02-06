import { BUCKET_NOT_DEFINED_MESSAGE } from "./messages";
import { CommonStorageUtils } from "./utils";
describe("CommonStorageService", () => {
  it("should be defined", async () => {
    expect(CommonStorageUtils).toBeDefined();
  });
  describe("parseBuketAndFilename", () => {
    it("should throw error if bucket not defined", async () => {
      expect(() => {
        CommonStorageUtils.parseBuketAndFilename("", {});
      }).toThrowError(BUCKET_NOT_DEFINED_MESSAGE);
    });
    it("should get bucket from filename", async () => {
      expect(CommonStorageUtils.parseBuketAndFilename("dir/to/filename", {})).toEqual({
        bucket: "dir",
        name: "to/filename",
      });
    });
    it("should get bucket of modult options", async () => {
      expect(CommonStorageUtils.parseBuketAndFilename("filename", { bucket: "module" })).toEqual({
        bucket: "module",
        name: "filename",
      });
    });

    it("should get bucket of options", async () => {
      expect(CommonStorageUtils.parseBuketAndFilename("filename", { bucket: "module" }, { bucket: "test" })).toEqual({
        bucket: "test",
        name: "filename",
      });
    });
  });

  describe("getCacheDir", () => {
    it("should get cache dir path", async () => {
      expect(CommonStorageUtils.getCacheDir({})).toEqual(expect.any(String));
      expect(CommonStorageUtils.getCacheDir({ cacheDir: "test" })).toBe("test");
    });
  });
});
