import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { StorageModule } from "../storage.module";
import { LocalStorage } from "./local.storage";
describe("LocalStorageModule", () => {
  let app: INestApplication;

  it("should set middlewares", async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket" })],
    }).compile();
    app = await module.createNestApplication(undefined, { bodyParser: false });
    await app.init();
    await app.close();
  });

  it("should set middlewares", async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket", storage: LocalStorage })],
    }).compile();
    app = await module.createNestApplication(undefined, { bodyParser: false });
    await app.init();
    await app.close();
  });
});
