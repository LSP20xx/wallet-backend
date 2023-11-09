// user.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/services/database/database.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  public async findAll(): Promise<User[]> {
    return this.databaseService.user.findMany();
  }

  public async findOne(userId: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { id: userId },
    });
  }

  public async update(id: string, userData: Partial<User>): Promise<User> {
    return this.databaseService.user.update({
      where: { id },
      data: userData,
    });
  }

  public async remove(id: string): Promise<void> {
    await this.databaseService.user.delete({
      where: { id },
    });
  }
}
