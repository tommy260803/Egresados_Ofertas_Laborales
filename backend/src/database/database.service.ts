import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async onApplicationShutdown(signal?: string) {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  async runMigrations() {
    return this.dataSource.runMigrations();
  }

  async getStatus() {
    return this.dataSource.isInitialized ? 'connected' : 'disconnected';
  }
}