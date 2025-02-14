import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
export class BlogDto {
    @Transform(({ obj }) => obj?._id.toString())
    @Expose()
    @ApiProperty({
        example: '65f1c4e8f1c4e8f1c4e8f1c4'
    })
    _id: string;
    @Expose()
    @ApiProperty({
        example: 'Test Blog',
    })
    title: string;
    @Expose()
    @ApiProperty({
        example: 'This is a test blog.'
    })
    content: string;
    @Expose()
    @ApiProperty({
        example: 'Tech'
    })
    category: string;
    @Transform(({ obj }) => {
        if (!obj.owner) return null;
        return {
            _id: obj.owner?._id.toString(),
            name: obj.owner?.name,
            email: obj.owner?.email,
        };
    })
    @Expose()
    @ApiProperty({
        example: {
            _id: '65f1c4e8f1c4e8f1c4e8f1c4',
            name: 'John',
            email: 'test@test.com'
        }
    })
    owner: { _id: string, name: string, email: string } | null;
}