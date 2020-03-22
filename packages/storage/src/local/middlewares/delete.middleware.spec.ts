import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { StorageModule } from "../../storage.module";
import { StorageService } from "../../storage.service";
describe("StorageDeleteMiddleware", () => {
  let app: INestApplication;
  let service: StorageService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket" })],
    }).compile();
    service = module.get<StorageService>(StorageService);
    app = await module.createNestApplication(undefined, { bodyParser: false });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should throw error if file not found", async () => {
    const url = await service.getSignedUrl("del-not-found-test.txt", { action: "delete" });
    await request(app.getHttpServer()).delete(url).expect(400, {
      error: "Bad Request",
      message: `File not found: {"bucket":"bucket","filename":"del-not-found-test.txt"}`,
      statusCode: 400,
    });
  });

  it("should delete file", async () => {
    let url = await service.getSignedUrl("path/to/del-test.txt", { action: "upload" });
    await request(app.getHttpServer()).put(url).attach("file", Buffer.from("test"), "test.txt").expect(204);

    url = await service.getSignedUrl("path/to/del-test.txt", { action: "delete" });

    await request(app.getHttpServer()).delete(url).expect(200);
  });
});
