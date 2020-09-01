import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { StorageModule } from "../../storage/src/storage.module";
import { LocalStorageModule } from "./local.module";
describe("LocalStorageModule", () => {
  let app: INestApplication;

  it("should set middlewares", async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket" }, LocalStorageModule.register())],
    }).compile();
    app = await module.createNestApplication(undefined, { bodyParser: false });
    await app.init();
    await app.close();
  });

  it("should set middlewares", async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket" }, LocalStorageModule.register())],
    }).compile();
    app = await module.createNestApplication(undefined, { bodyParser: false });
    await app.init();
    await app.close();
  });
});
