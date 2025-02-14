import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { BlogsService } from '../blogs/blogs.service';

@Injectable()
export class BlogOwnerGuard implements CanActivate {
    constructor(
        private readonly blogService: BlogsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.currentUser as any;
        const blogId = request.params.id;
        let blog;
        try {
            // Fetch the blog from the database
            blog = await this.blogService.findOne(blogId);
        }
        catch (error) {
            throw new UnauthorizedException('You are not authorized to perform this action');
        }

        // Check if the authenticated user is the owner of the blog
        if (blog.owner._id.toString() !== user._id.toString()) {
            throw new UnauthorizedException('You are not authorized to perform this action');
        }

        return true;
    }
}