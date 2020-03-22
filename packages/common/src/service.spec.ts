import { Test } from "@nestjs/testing";
import { STORAGE_MODULE_OPTIONS } from "./constants";
import { StorageModuleOptions } from "./interfaces";
import { BUCKET_NOT_DEFINED_MESSAGE } from "./messages";
import { CommonStorageService } from "./service";
describe("CommonStorageService", () => {
  const getCommonService = (moduleOptions: StorageModuleOptions): Promise<CommonStorageService> =>
    Test.createTestingModule({
      providers: [CommonStorageService, { provide: STORAGE_MODULE_OPTIONS, useValue: moduleOptions }],
    })
      .compile()
      .then((app) => app.get<CommonStorageService>(CommonStorageService));

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

  describe("getCacheDir", () => {
    it("should get cache dir path", async () => {
      let service = await getCommonService({});
      expect(service.getCacheDir()).toEqual(expect.any(String));

      service = await getCommonService({ cacheDir: "test" });
      expect(service.getCacheDir()).toBe("test");
    });
  });
});
