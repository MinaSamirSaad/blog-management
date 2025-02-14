import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './schemas/blog.schema';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name, { timestamp: true });
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    private usersService: UsersService,
  ) { }

  /**
   * Creates a new blog and updates the user's blogs array.
   * @param blog - The blog data to create.
   * @param ownerId - The ID of the user who owns the blog.
   * @returns {Promise<Blog>} The created blog.
   * @throws {InternalServerErrorException} If updating the user's blogs array fails.
   */
  async create(blog: CreateBlogDto, ownerId: string): Promise<Blog> {
    const savedBlog = await this.createNewBlog(blog, ownerId);
    try {
      // Update the user's blogs array
      await this.usersService.updateUserBlogs(ownerId, savedBlog._id.toString(), 'add');
    } catch (error) {
      // If updating the user fails, delete the blog to maintain consistency
      await this.blogModel.findByIdAndDelete(savedBlog._id);
      throw new InternalServerErrorException('Failed to update user blogs: ' + error.message);
    }

    return savedBlog;
  }

  /**
   * Creates a new blog in the database.
   * @param blog - The blog data to create.
   * @param ownerId - The ID of the user who owns the blog.
   * @returns {Promise<Blog>} The saved blog.
   * @throws {InternalServerErrorException} If the blog creation fails.
   */
  async createNewBlog(blog: CreateBlogDto, ownerId: string) {
    try {
      const newBlog = new this.blogModel({ ...blog, owner: ownerId });
      return await newBlog.save();
    }
    catch (error) {
      this.logger.error('Failed to create blog: ' + error.message);
      throw new InternalServerErrorException('Failed to create blog: ' + error.message);
    }
  }

  /**
   * Retrieves all blogs from the database.
   * @returns {Promise<Blog[]>} An array of all blogs.
   */
  async findAll(): Promise<Blog[]> {
    try {
      return await this.blogModel.find().populate('owner').exec();
    } catch (error) {
      this.logger.error('Failed to fetch blogs: ' + error.message);
      throw new InternalServerErrorException('Failed to fetch blogs: ' + error.message);
    }
  }

  /**
   * Retrieves a blog by its ID.
   *
   * @param id - The ID of the blog to retrieve.
   * @returns {Promise<Blog>} The retrieved blog.
   */
  async findOne(id: string): Promise<Blog> {
    return await this.validateBlogId(id);
  }

  /**
   * Updates a blog by its ID.
   *
   * @param id - The ID of the blog to update.
   * @param updateBlogDto - The data to update the blog with.
   * @returns {Promise<Blog>} The updated blog.
   * @throws {BadRequestException} If the blog ID is invalid.
   * @throws {InternalServerErrorException} If updating the blog fails.
   */
  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid blog ID');
    }
    try {
      return await this.blogModel.findByIdAndUpdate(id, updateBlogDto, { new: true }).populate('owner').exec();
    }
    catch (error) {
      this.logger.error('Failed to update blog: ' + error.message);
      throw new InternalServerErrorException('Failed to update blog: ' + error.message);
    }
  }

  /**
   * Removes a blog by its ID and updates the user's blogs array.
   * @param blogId - The ID of the blog to remove.
   * @param ownerId - The ID of the user who owns the blog.
   * @returns {Promise<Blog>} The removed blog.
   * @throws {InternalServerErrorException} If removing the blog or updating the user's blogs array fails.
   */
  async remove(blogId: string, ownerId: string): Promise<Blog> {
    try {
      await this.usersService.updateUserBlogs(ownerId, blogId, 'remove');
      return await this.blogModel.findByIdAndDelete(blogId);
    } catch (error) {
      this.logger.error('Failed to remove blog: ' + error.message);
      throw new InternalServerErrorException('Failed to remove blog: ' + error.message);
    }
  }

  /**
   * Validates a blog ID and retrieves the blog if it exists.
   * @param id - The ID of the blog to validate and retrieve.
   * @returns {Promise<Blog>} The retrieved blog.
   * @throws {BadRequestException} If the blog ID is invalid.
   * @throws {NotFoundException} If the blog is not found.
   * @throws {InternalServerErrorException} If fetching the blog fails.
   */
  async validateBlogId(id: string): Promise<Blog> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid blog ID');
    }
    try {
      const blog = await this.blogModel.findById(id).populate('owner').exec();
      if (!blog) {
        throw new NotFoundException('Blog not found');
      }
      return blog;
    } catch (error) {
      this.logger.error('Failed to fetch blog: ' + error.message);
      throw new InternalServerErrorException('Failed to fetch blog: ' + error.message);
    }
  }

  /**
   * Retrieves blogs with pagination support.
   * @param page - The page number (starting from 1).
   * @param limit - The number of blogs per page.
   * @returns {Promise<{ data: Blog[]; total: number }>} An object containing the paginated blogs and the total count.
   */
  async findAllPaginated(page: number, limit: number): Promise<{ data: Blog[], total: number }> {
    try {
      // Calculate the number of blogs to skip
      const skip = (page - 1) * limit;
      const data = await this.blogModel.find().skip(skip).limit(limit).populate('owner').exec();
      const total = await this.blogModel.countDocuments().exec();
      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch paginated blogs: ' + error.message);
    }
  }

  /**
   * Searches blogs by a keyword in the title or content.
   * @param keyword - The keyword to search for.
   * @returns {Promise<Blog[]>} An array of blogs matching the search criteria.
   */
  async searchBlogs(keyword: string): Promise<Blog[]> {
    try {
      return await this.blogModel
        .find({
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { content: { $regex: keyword, $options: 'i' } },
          ],
        })
        .populate('owner').exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to search blogs: ' + error.message);
    }
  }

  /**
   * Filters blogs by specific criteria (e.g., category, owner).
   * @param filter - The filter criteria like { category: 'Tech', owner: 'user1' }.
   * @returns {Promise<Blog[]>} An array of blogs matching the filter criteria.
   */
  async filterBlogs(filter: { [key: string]: any }): Promise<Blog[]> {
    try {
      return await this.blogModel.find(filter).populate('owner').exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to filter blogs: ' + error.message);
    }
  }
}
