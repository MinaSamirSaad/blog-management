import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Blog } from 'src/blogs/schemas/blog.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({
        max: [30, 'name must be at most 30 characters'],
        min: [3, 'name must be at least 3 characters'],
        required: true,
        type: String
    })
    name: string;

    @Prop({
        required: true,
        unique: true,
        type: String
    })
    email: string;

    @Prop({
        required: true,
        type: String
    })
    password: string;

    @Prop({
        type: [{ type: Types.ObjectId, ref: 'Blog' }],
        default: [],
        ref: 'Blog'
    })
    blogs: [Types.ObjectId];
}

export const UserSchema = SchemaFactory.createForClass(User);