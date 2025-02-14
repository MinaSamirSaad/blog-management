import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { CreateBlogDto } from "../../blogs/dto/create-blog.dto";
export class UserDto {
    @Transform(({ obj }) => obj?._id.toString())
    @Expose()
    @ApiProperty({
        example: '65f1c4e8f1c4e8f1c4e8f1c4'
    })
    _id: string;
    @Expose()
    @ApiProperty({
        example: 'John',
    })
    name: string;
    @Expose()
    @ApiProperty({
        example: 'test@test.com'
    })
    email: string;
    @Transform(({ obj }) => obj.blogs.map(blog => ({ _id: blog?._id.toString(), title: blog.title, content: blog.content, category: blog.category })))
    @Expose()
    @ApiProperty({
        type: [CreateBlogDto]
    })
    blogs: typeof CreateBlogDto[];
}