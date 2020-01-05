import { Test } from "@nestjs/testing";
import { STORAGE_MODULE_OPTIONS } from "./constants";
import { StorageModuleOptions } from "./interfaces";
import { BUCKET_NOT_DEFINED_MESSAGE } from "./messages";
import { CommonStorageService } from "./service";
describe("CommonStorageService", () => {
  const getCommonService = (moduleOptions: StorageModuleOptions) =>
    Test.createTestingModule({
      providers: [CommonStorageService, { provide: STORAGE_MODULE_OPTIONS, useValue: moduleOptions }],
    })
      .compile()
      .then(app => app.get<CommonStorageService>(CommonStorageService));

  it("should be defined", async () => {
    expect(CommonStorageService).toBeDefined();
    await expect(getCommonService({})).resolves.toBeDefined();
  });
  describe("getBucket", () => {
    it("should throw error if bucket not defined", async () => {
      const service = await getCommonService({});
      expect(() => {
        service.getBucket();
      }).toThrowError(BUCKET_NOT_DEFINED_MESSAGE);
    });

    it("should get bucket of modult options", async () => {
      const service = await getCommonService({ bucket: "module" });
      expect(service.getBucket()).toBe("module");
    });

    it("should get bucket of options", async () => {
      const service = await getCommonService({ bucket: "module" });
      expect(service.getBucket({ bucket: "test" })).toBe("test");
    });
  });

  describe("getBucket", () => {
    it("should return empty string", async () => {
      const service = await getCommonService({});
      expect(service.getPrefix()).toBe("");
    });

    it("should return strings", async () => {
      const service = await getCommonService({});
      expect(service.getPrefix({ prefix: "test" })).toBe("test");
    });
  });
});
