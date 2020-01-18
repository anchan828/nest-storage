import { SignedUrlActionType, StorageModuleOptions, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { isArray } from "util";
import { StorageService } from "../../storage.service";
import { StorageBaseMiddleware } from "./base.middleware";
@Injectable()
export class StorageUploadMiddleware extends StorageBaseMiddleware {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS)
    readonly moduleOptions: StorageModuleOptions,
    private readonly service: StorageService,
  ) {
    super(moduleOptions);
  }

  getAction(): SignedUrlActionType {
    return "upload";
  }

  async handler(filename: string, req: Request, res: Response): Promise<void> {
    if (!isArray(req.files) || req.files.length === 0) {
      // file not uploaded
      throw new BadRequestException("The file was not uploaded");
    }

    const file = req.files[0];
    await this.service
      .upload(file.path, filename)
      .then(() => {
        res.status(204).end();
      })
      .catch(e => {
        throw new BadRequestException(e.message);
      });
  }
}
