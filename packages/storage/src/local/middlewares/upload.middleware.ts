import { SignedUrlActionType, StorageModuleOptions, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { BadRequestException, Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { isArray } from "util";
import { StorageService } from "../../storage.service";
import { SIGNED_URL_CONTROLLER_TOKEN } from "../constants";
@Injectable()
export class StorageUploadMiddleware implements NestMiddleware {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) private readonly moduleOptions: StorageModuleOptions,
    private readonly service: StorageService,
  ) {}

  async use(req: Request, res: Response): Promise<void> {
    const { "0": filename, bucket } = req.params as { "0": string; bucket: string };
    const { signature } = req.query as { signature: string };
    const token = this.moduleOptions.signedUrlController?.token || SIGNED_URL_CONTROLLER_TOKEN;
    const decoded = jwt.verify(signature, token) as { action: SignedUrlActionType; bucket: string; filename: string };

    if (decoded.action !== "upload") {
      // invalid action
      throw new BadRequestException(`Invalid action '${decoded.action}'. action should be 'upload'`);
    }

    if (decoded.bucket !== bucket) {
      // invalid bucket
      throw new BadRequestException(`Invalid bucket '${bucket}'`);
    }

    if (decoded.filename !== filename) {
      // invalid filename
      throw new BadRequestException(`Invalid filename '${filename}'`);
    }

    if (!isArray(req.files) || req.files.length === 0) {
      // file not uploaded
      throw new BadRequestException("The file was not uploaded");
    }

    const file = req.files[0];
    await this.service.upload(file.path, filename);
    res.status(204).end();
  }
}
