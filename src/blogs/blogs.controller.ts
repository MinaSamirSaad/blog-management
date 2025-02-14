import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { BlogDto } from './dto/blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogOwnerGuard } from '../guards/blog-owner.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Blogs')
@Serialize(BlogDto)
@Controller('api/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) { }

  // ========================== create ==========================
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiResponse({ status: 201, description: 'The blog has been successfully created', example: BlogDto })
  @ApiResponse({ status: 500, description: 'Failed to update user blogs' })
  @ApiResponse({ status: 500, description: 'Failed to create blog' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req, @Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(createBlogDto, req?.currentUser?._id);
  }

  // ========================== findAll ==========================
  @ApiOperation({ summary: 'Get all blogs' })
  @ApiResponse({ status: 200, description: 'Returns all blogs', type: [BlogDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get()
  findAll() {
    return this.blogsService.findAll();
  }

  // ========================== remove ==========================
  @ApiOperation({ summary: 'Delete a blog' })
  @ApiResponse({ status: 200, description: 'The blog has been successfully deleted', type: BlogDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Failed to delete blog' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseGuards(BlogOwnerGuard)
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.blogsService.remove(id, req?.currentUser?._id);
  }

  // ========================== findAllPaginated ==========================
  @ApiOperation({ summary: 'Get all blogs paginated' })
  @ApiResponse({ status: 200, description: 'Returns all blogs paginated', type: [BlogDto] })
  @ApiResponse({ status: 400, description: 'Page must be a number' })
  @ApiResponse({ status: 400, description: 'Limit must be a number' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @Get('paginated')
  async findAllPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (isNaN(page)) throw new BadRequestException('Page must be a number');
    if (isNaN(limit)) throw new BadRequestException('Limit must be a number');
    return this.blogsService.findAllPaginated(page, limit);
  }

  // ========================== searchBlogs ==========================
  @ApiOperation({ summary: 'Search for blogs' })
  @ApiResponse({ status: 200, description: 'Returns the search results', type: [BlogDto] })
  @ApiResponse({ status: 400, description: 'Keyword is required' })
  @ApiQuery({ name: 'keyword', required: true })
  @Get('search')
  async searchBlogs(@Query('keyword') keyword: string) {
    if (!keyword) throw new BadRequestException('Keyword is required');
    return this.blogsService.searchBlogs(keyword);
  }

  // ========================== filterBlogs ==========================
  @ApiOperation({ summary: 'Filter blogs' })
  @ApiResponse({ status: 200, description: 'Returns the filtered blogs', type: [BlogDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'owner', required: false })
  @Get('filter')
  async filterBlogs(
    @Query('category') category?: string,
    @Query('owner') owner?: string,
  ) {
    const filter: { [key: string]: any } = {};
    if (category) filter.category = category;
    if (owner) filter.owner = owner;
    return this.blogsService.filterBlogs(filter);
  }


  // ========================== update ==========================
  @ApiOperation({ summary: 'Update a blog' })
  @ApiResponse({ status: 200, description: 'The blog has been successfully updated', type: BlogDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Failed to update blog' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseGuards(BlogOwnerGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(id, updateBlogDto);
  }

  // ========================== findOne ==========================
  @ApiOperation({ summary: 'Get a blog by ID' })
  @ApiResponse({ status: 200, description: 'Returns the blog', type: BlogDto })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  @ApiResponse({ status: 400, description: 'Invalid blog ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }
}
