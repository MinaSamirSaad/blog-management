import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { create } from 'domain';

const mockUser = {
  _id: '507f191e810c19729de860ea',
  email: 'test@example.com',
  blogs: [],
};

const mockUserModel = {
  new: jest.fn().mockResolvedValue(mockUser),
  constructor: jest.fn().mockResolvedValue(mockUser),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  populate: jest.fn(),
  exec: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'test',
        password: 'Test.password123'
      };
      jest.spyOn(model, 'create').mockResolvedValue(mockUser as any);
      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw a conflict exception if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'test',
        password: 'Test.password123',
      };
      jest.spyOn(model, 'create').mockRejectedValue({ code: 11000 });
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockUser])
        })
      } as any);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      } as any);
      const result = await service.findOne(mockUser._id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a single user by email', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      } as any);
      const result = await service.findOneByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserBlogs', () => {
    it('should add a blog to the user', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(mockUser as any);
      await service.updateUserBlogs(mockUser._id, 'blogId', 'add');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
        $push: { blogs: 'blogId' },
      });
    });

    it('should remove a blog from the user', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(mockUser as any);
      await service.updateUserBlogs(mockUser._id, 'blogId', 'remove');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
        $pull: { blogs: 'blogId' },
      });
    });
  });
});