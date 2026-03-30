import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        passwordHash,
      },
    });

    return this.excludeSensitive(user);
  }

  async findAll(): Promise<Array<Omit<User, 'passwordHash'>>> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.excludeSensitive(user));
  }

  async findOne(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.excludeSensitive(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    await this.ensureExists(id);

    const data: Prisma.UserUpdateInput = {
      email: updateUserDto.email,
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      role: updateUserDto.role,
    };

    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.excludeSensitive(updated);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.ensureExists(id);
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const refreshTokenHash = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private excludeSensitive(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
