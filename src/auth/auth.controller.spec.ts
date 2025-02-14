import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockAccessToken'),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should return an access token', async () => {
      const user = { name: 'testName', email: 'test@example.com', password: 'password' };
      jest.spyOn(authService, 'signUp').mockResolvedValue({ access_token: 'mockAccessToken' });

      const result = await authController.signUp(user);
      expect(result).toEqual({ access_token: 'mockAccessToken' });
      expect(authService.signUp).toHaveBeenCalledWith(user);
    });
  });

  describe('signIn', () => {
    it('should return an access token', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      jest.spyOn(authService, 'signIn').mockResolvedValue({ access_token: 'mockAccessToken' });

      const result = await authController.signIn(credentials);
      expect(result).toEqual({ access_token: 'mockAccessToken' });
      expect(authService.signIn).toHaveBeenCalledWith(credentials.email, credentials.password);
    });
  });
});
