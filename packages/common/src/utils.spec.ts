import { BUCKET_NOT_DEFINED_MESSAGE } from "./messages";
import { CommonStorageUtils } from "./utils";
describe("CommonStorageService", () => {
  it("should be defined", async () => {
    expect(CommonStorageUtils).toBeDefined();
  });
  describe("getBucket", () => {
    it("should throw error if bucket not defined", async () => {
      expect(() => {
        CommonStorageUtils.getBucket("", {});
      }).toThrowError(BUCKET_NOT_DEFINED_MESSAGE);
    });
    it("should get bucket from filename", async () => {
      expect(CommonStorageUtils.getBucket("dir/to/filename", {})).toBe("dir");
    });
    it("should get bucket of modult options", async () => {
      expect(CommonStorageUtils.getBucket("filename", { bucket: "module" })).toBe("module");
    });

    it("should get bucket of options", async () => {
      expect(CommonStorageUtils.getBucket("filename", { bucket: "module" }, { bucket: "test" })).toBe("test");
    });
  });

  describe("getCacheDir", () => {
    it("should get cache dir path", async () => {
      expect(CommonStorageUtils.getCacheDir({})).toEqual(expect.any(String));
      expect(CommonStorageUtils.getCacheDir({ cacheDir: "test" })).toBe("test");
    });
  });
});
