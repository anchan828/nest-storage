import type { SignedUrlActionType } from "@anchan828/nest-storage-common";
import { STORAGE_PROVIDER_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import type { NestMiddleware } from "@nestjs/common";
import { BadRequestException, Inject } from "@nestjs/common";
import type { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { SIGNED_URL_CONTROLLER_TOKEN } from "../constants";
import { LocalStorageProviderModuleOptions } from "../interfaces";
export abstract class StorageBaseMiddleware implements NestMiddleware<Request, Response> {
  constructor(
    @Inject(STORAGE_PROVIDER_MODULE_OPTIONS) protected readonly moduleOptions: LocalStorageProviderModuleOptions,
  ) {}

  abstract getAction(): SignedUrlActionType;

  abstract handler(bucket: string, filename: string, req?: Request, res?: Response): Promise<void>;

  public async use(req: Request, res: Response): Promise<void> {
    const { "0": filename, bucket } = req.params as { "0": string; bucket: string };
    const { signature } = req.query as { signature: string };
    const token = this.moduleOptions.signedUrlController?.token || SIGNED_URL_CONTROLLER_TOKEN;
    const decoded = jwt.verify(signature, token) as { action: SignedUrlActionType; bucket: string; filename: string };
    const action = this.getAction();
    if (decoded.action !== action) {
      // invalid action
      throw new BadRequestException(`Invalid action '${decoded.action}'. action should be '${action}'`);
    }

    if (decoded.bucket !== bucket) {
      // invalid bucket
      throw new BadRequestException(`Invalid bucket '${bucket}'`);
    }

    if (decoded.filename !== filename) {
      // invalid filename
      throw new BadRequestException(`Invalid filename '${filename}'`);
    }

    await this.handler(bucket, filename, req, res);

    if (!res.writableEnded) {
      res.status(200).end();
    }
  }
}
