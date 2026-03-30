import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma 5 non supporta più $on('beforeExit')
    // NestJS gestisce già la chiusura tramite i suoi shutdown hooks
    app.enableShutdownHooks();
  }
}
