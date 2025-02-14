import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateBlogDto {
    @IsString({ message: 'title must be a string' })
    @MaxLength(100, { message: 'title must be less than 100 characters' })
    @MinLength(3, { message: 'title must be at least 3 characters' })
    @IsOptional()
    @ApiProperty({
        example: 'javascript',
        required: false,
        description: 'A valid title for the blog',
        maxLength: 100,
        minLength: 3,
    })
    title: string;

    @IsString({ message: 'content must be a string' })
    @MaxLength(1200, { message: 'content must be less than 1200 characters' })
    @MinLength(10, { message: 'content must be at least 10 characters' })
    @ApiProperty({
        example: 'A blog about javascript',
        required: false,
        description: 'A valid content for the blog',
        maxLength: 1200,
        minLength: 10,
    })
    @IsOptional()
    content: string;

    @IsString({ message: 'category must be a string' })
    @ApiProperty({
        example: 'programming',
        required: false,
        description: 'A valid category for the blog',
        type: 'string',
    })
    @IsOptional()
    category: string;
}
