import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';


jest.mock('crypto', () => {
  const originalModule = jest.requireActual('crypto');
  return {
    ...originalModule,
    randomBytes: jest.fn().mockReturnValue(Buffer.from('randomSalt', 'utf8')),
    scrypt: jest.fn().mockImplementation((inputPassword, salt, keylen, callback) => {
      // Simulate the hashing process
      const hashedPassword = Buffer.from(inputPassword + salt, 'utf8');
      callback(null, hashedPassword);
    }),
  };
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const usersMock = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };

    const jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mockAccessToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: UsersService, useValue: usersMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // ========================== signUp ==========================
  describe('signUp', () => {
    it('should create a new user with a hashed password', async () => {
      const user = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Strongpassword123',
      };

      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue({
        _id: '123',
        ...user,
        password: 'randomSalt.hashedpassword',
      });

      const result = await authService.signUp(user);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(user.email);
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw an error if email is already in use', async () => {
      const user = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Strongpassword123',
      };
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(user);
      await expect(authService.signUp(user)).rejects.toThrow(BadRequestException);
    });
  });

  // ========================== signIn ==========================
  describe('signIn', () => {
    it('should return the user if password matches', async () => {
      const email = 'test@example.com';
      const password = 'Strongpassword123';
      const storedPassword = 'randomSalt.hashedpassword';

      (usersService.findOneByEmail as jest.Mock).mockResolvedValue({ email, password: storedPassword });
      (authService as any).verifyPassword = jest.fn().mockResolvedValue(true);
      const result = await authService.signIn(email, password);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(result).toHaveProperty('access_token');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.signIn('notfound@example.com', 'password')).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'randomSalt.hashedpassword';

      (usersService.findOneByEmail as jest.Mock).mockResolvedValue({ email, password: hashedPassword });

      await expect(authService.signIn(email, password)).rejects.toThrow(UnauthorizedException);
    });
  });
});