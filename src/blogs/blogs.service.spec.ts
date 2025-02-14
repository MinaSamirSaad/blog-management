import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { getModelToken } from '@nestjs/mongoose';
import { Blog } from './schemas/blog.schema';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('BlogsService', () => {
  let blogsService: BlogsService;
  let blogModel: Model<Blog>;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getModelToken(Blog.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            populate: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            updateUserBlogs: jest.fn(),
          },
        },
      ],
    }).compile();

    blogsService = module.get<BlogsService>(BlogsService);
    blogModel = module.get<Model<Blog>>(getModelToken(Blog.name));
    usersService = module.get<UsersService>(UsersService);
  });

  // ========================== create ==========================
  describe('create', () => {
    it('should create a new blog and update the user', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'This is a test blog.',
        category: 'Tech',
      };
      const ownerId = '65f1c4e8f1c4e8f1c4e8f1c4';
      const savedBlog = { _id: '65f1c4e8f1c4e8f1c4e8f1c5', ...createBlogDto, owner: ownerId };

      blogsService.createNewBlog = jest.fn().mockResolvedValue(savedBlog);
      usersService.updateUserBlogs = jest.fn().mockResolvedValue(undefined);

      const result = await blogsService.create(createBlogDto, ownerId);

      expect(usersService.updateUserBlogs).toHaveBeenCalledWith(ownerId, savedBlog._id.toString(), 'add');
      expect(result).toEqual(savedBlog);
    });

    it('should throw an error if updating the user fails', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'This is a test blog.',
        category: 'Tech',
      };
      const ownerId = '65f1c4e8f1c4e8f1c4e8f1c4';
      const savedBlog = { _id: '65f1c4e8f1c4e8f1c4e8f1c5', ...createBlogDto, owner: ownerId };

      blogsService.createNewBlog = jest.fn().mockResolvedValue(savedBlog);
      jest.spyOn(usersService, 'updateUserBlogs').mockRejectedValue(new Error('User update failed'));
      blogModel.findByIdAndDelete = jest.fn();

      await expect(blogsService.create(createBlogDto, ownerId)).rejects.toThrow(InternalServerErrorException);
      expect(blogModel.findByIdAndDelete).toHaveBeenCalledWith(savedBlog._id);
    });
  });

  // ========================== findAll ==========================
  describe('findAll', () => {
    it('should return an array of blogs', async () => {
      const blogs = [
        { _id: '65f1c4e8f1c4e8f1c4e8f1c5', title: 'Blog 1', content: 'Content 1', category: 'Tech', owner: '65f1c4e8f1c4e8f1c4e8f1c4' },
        { _id: '65f1c4e8f1c4e8f1c4e8f1c6', title: 'Blog 2', content: 'Content 2', category: 'Health', owner: '65f1c4e8f1c4e8f1c4e8f1c4' },
      ];

      jest.spyOn(blogModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(blogs),
        }),
      } as any);

      const result = await blogsService.findAll();

      expect(blogModel.find).toHaveBeenCalled();
      expect(result).toEqual(blogs);
    });
  });

  // ========================== findOne ==========================
  describe('findOne', () => {
    it('should return a blog if it exists', async () => {
      const blog = { _id: '65f1c4e8f1c4e8f1c4e8f1c5', title: 'Blog 1', content: 'Content 1', category: 'Tech', owner: '65f1c4e8f1c4e8f1c4e8f1c4' };

      jest.spyOn(blogModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(blog),
        }),
      } as any);
      const result = await blogsService.findOne(blog._id);

      expect(blogModel.findById).toHaveBeenCalledWith(blog._id);
      expect(result).toEqual(blog);
    });

    it('should throw NotFoundException if the blog does not exist', async () => {
      jest.spyOn(blogModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as any);
      (blogsService.validateBlogId = jest.fn().mockRejectedValue(new NotFoundException()));
      await expect(blogsService.findOne('65f1c4e8f1c4e8f1c4e8f1c5')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if the blog ID is invalid', async () => {
      await expect(blogsService.findOne('invalid-id')).rejects.toThrow(BadRequestException);
    });
  });

  // ========================== update ==========================
  describe('update', () => {
    it('should update a blog if it exists', async () => {
      const updateBlogDto: UpdateBlogDto = { title: 'Updated Blog', content: 'Updated content', category: 'Health' };
      const updatedBlog = { _id: '65f1c4e8f1c4e8f1c4e8f1c5', ...updateBlogDto };

      jest.spyOn(blogModel, 'findByIdAndUpdate').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedBlog),
        }),
      } as any);

      const result = await blogsService.update('65f1c4e8f1c4e8f1c4e8f1c5', updateBlogDto);

      expect(blogModel.findByIdAndUpdate).toHaveBeenCalledWith('65f1c4e8f1c4e8f1c4e8f1c5', updateBlogDto, { new: true });
      expect(result).toEqual(updatedBlog);
    });

    it('should throw BadRequestException if the blog ID is invalid', async () => {
      await expect(blogsService.update('invalid-id', {} as UpdateBlogDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if the update fails', async () => {
      jest.spyOn(blogModel, 'findByIdAndUpdate').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new InternalServerErrorException('Update failed')),
        }),
      } as any);

      await expect(blogsService.update('65f1c4e8f1c4e8f1c4e8f1c5', {} as UpdateBlogDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ========================== remove ==========================
  describe('remove', () => {
    it('should remove a blog and update the user', async () => {
      const blogId = '65f1c4e8f1c4e8f1c4e8f1c5';
      const ownerId = '65f1c4e8f1c4e8f1c4e8f1c4';

      jest.spyOn(usersService, 'updateUserBlogs').mockResolvedValue(undefined);
      jest.spyOn(blogModel, 'findByIdAndDelete').mockResolvedValue(null);

      await blogsService.remove(blogId, ownerId);

      expect(usersService.updateUserBlogs).toHaveBeenCalledWith(ownerId, blogId, 'remove');
      expect(blogModel.findByIdAndDelete).toHaveBeenCalledWith(blogId);
    });

    it('should throw InternalServerErrorException if the removal fails', async () => {
      const blogId = '65f1c4e8f1c4e8f1c4e8f1c5';
      const ownerId = '65f1c4e8f1c4e8f1c4e8f1c4';

      jest.spyOn(usersService, 'updateUserBlogs').mockRejectedValue(new InternalServerErrorException('Removal failed'));

      await expect(blogsService.remove(blogId, ownerId)).rejects.toThrow(InternalServerErrorException);
    });
  });
});