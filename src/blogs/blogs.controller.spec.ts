import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: BlogsService;

  const mockBlogsService = {
    create: jest.fn((dto, userId) => {
      return {
        _id: '1',
        ...dto,
        owner: userId,
      };
    }),
    findAll: jest.fn(() => {
      return [
        { _id: '1', title: 'Test Blog', content: 'Test Content' },
      ];
    }),
    findOne: jest.fn((id) => {
      return { _id: id, title: 'Test Blog', content: 'Test Content' };
    }),
    update: jest.fn((id, dto) => {
      return { _id: id, ...dto };
    }),
    remove: jest.fn((id, userId) => {
      return { _id: id, owner: userId };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: mockBlogsService,
        },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a blog', async () => {
    const createBlogDto: CreateBlogDto = { title: 'Test Blog', content: 'Test Content', category: 'Tech' };
    const req = { currentUser: { _id: 'user1' } };
    expect(await controller.create(req, createBlogDto)).toEqual({
      _id: '1',
      title: 'Test Blog',
      content: 'Test Content',
      category: 'Tech',
      owner: 'user1',
    });
    expect(service.create).toHaveBeenCalledWith(createBlogDto, 'user1');
  });

  it('should return all blogs', async () => {
    expect(await controller.findAll()).toEqual([
      { _id: '1', title: 'Test Blog', content: 'Test Content' },
    ]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a single blog', async () => {
    expect(await controller.findOne('1')).toEqual({
      _id: '1',
      title: 'Test Blog',
      content: 'Test Content',
    });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should update a blog', async () => {
    const updateBlogDto: UpdateBlogDto = { title: 'Updated Blog', content: 'Updated Content', category: 'Tech' };
    expect(await controller.update('1', updateBlogDto)).toEqual({
      _id: '1',
      title: 'Updated Blog',
      content: 'Updated Content',
      category: 'Tech'
    });
    expect(service.update).toHaveBeenCalledWith('1', updateBlogDto);
  });

  it('should remove a blog', async () => {
    const req = { currentUser: { _id: 'user1' } };
    expect(await controller.remove(req, '1')).toEqual({
      _id: '1',
      owner: 'user1',
    });
    expect(service.remove).toHaveBeenCalledWith('1', 'user1');
  });
});