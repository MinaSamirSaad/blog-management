import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from '../users/dto/signin.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from '../users/dto/user.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ========================== signIn ==========================
  @ApiOperation({ summary: 'User Signin' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Successful login', example: { 'access_token': 'valid token' } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('signin')
  async signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body.email, body.password);
  }

  // ========================== signUp ==========================
  @ApiOperation({ summary: 'User Signup' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered', example: { 'access_token': 'valid token' } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('signup')
  async signUp(@Body() body: CreateUserDto) {
    return this.authService.signUp(body);
  }

  // ========================== whoAmI ==========================
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns the current user', type: UserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Serialize(UserDto)
  @Get('whoami')
  async whoAmI(@Req() req) {
    return req.currentUser;
  }
}
