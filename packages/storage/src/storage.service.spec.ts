import { AbstractStorage } from "@anchan828/nest-storage-common";
import { Test } from "@nestjs/testing";
import { dirSync } from "tmp";
import { StorageModule } from "./storage.module";
import { StorageService } from "./storage.service";

describe("StorageService", () => {
  it("should create custom storage provider", async () => {
    class CustomStorage extends AbstractStorage {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async upload(dataPath: string, filename: string): Promise<string> {
        return filename;
      }

      async download(filename: string): Promise<string> {
        return filename;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
      async delete(filename: string): Promise<void> {}
    }
    const app = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket", cacheDir: dirSync().name, storage: CustomStorage })],
    }).compile();
    const service = app.get<StorageService>(StorageService);
    expect(service["storage"]).toBeInstanceOf(CustomStorage);
  });
});
