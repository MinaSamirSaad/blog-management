import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: true })
export class Blog {
    @Prop({
        max: [100, 'title must be at most 100 characters'],
        min: [3, 'title must be at least 3 characters'],
        required: true,
        type: String
    })
    title: string;

    @Prop({
        max: [1200, 'content must be at most 1200 characters'],
        min: [10, 'content must be at least 10 characters'],
        required: true,
        type: String
    })
    content: string;

    @Prop({
        required: true,
        type: String
    })
    category: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true
    })
    owner: Types.ObjectId;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);