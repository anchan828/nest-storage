import { SignedUrlActionType, StorageModuleOptions, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { StorageService } from "../../storage.service";
import { StorageBaseMiddleware } from "./base.middleware";
@Injectable()
export class StorageDeleteMiddleware extends StorageBaseMiddleware {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS)
    readonly moduleOptions: StorageModuleOptions,
    private readonly service: StorageService,
  ) {
    super(moduleOptions);
  }

  getAction(): SignedUrlActionType {
    return "delete";
  }

  async handler(bucket: string, filename: string): Promise<void> {
    await this.service.delete(filename, { bucket }).catch((e) => {
      throw new BadRequestException(e.message);
    });
  }
}
