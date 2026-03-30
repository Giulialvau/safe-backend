import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  refresh(@Req() req: Request) {
    const user = req.user as {
      sub: string;
      email: string;
      role: Role;
      refreshToken: string;
    };

    return this.authService.refresh(
      user.sub,
      user.email,
      user.role,
      user.refreshToken,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.authService.logout(user.sub);
  }
}
