// user.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  public async findAll(): Promise<User[]> {
    return this.databaseService.user.findMany();
  }

  public async getUserInfoById(userId: string): Promise<{
    completeName: string;
    language: string;
    localCurrency: string;
    notifyByEmail: boolean;
    notifyByPush: boolean;
    notifyBySms: boolean;
    notifyByWhatsApp: boolean;
  }> {
    const user = await this.databaseService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return null;
    }

    return {
      completeName: user.completeName,
      language: user.language,
      localCurrency: user.localCurrency,
      notifyByEmail: user.notifyByEmail,
      notifyByPush: user.notifyByPush,
      notifyBySms: user.notifyBySms,
      notifyByWhatsApp: user.notifyByWhatsApp,
    };
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
