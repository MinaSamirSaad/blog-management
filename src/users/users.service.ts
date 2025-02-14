import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name, { timestamp: true });
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    /**
     * Creates a new user.
     * @param signupData - The user data to create.
     * @returns {Promise<User>} The created user.
     * @throws {ConflictException} If the email already exists.
     * @throws {Error} If an unexpected error occurs.
     */
    async create(signupData: SignUpDto): Promise<User> {
        try {
            const user = await this.userModel.create(signupData);
            return user;
        } catch (error) {
            if (error?.code === 11000) {
                throw new ConflictException('Email already exists');
            }
            throw new InternalServerErrorException('Failed to create user: ' + error.message);
        }
    }

    /**
     * Retrieves all users.
     * @returns {Promise<User[]>} An array of all users.
     */
    async findAll(): Promise<User[]> {
        return this.userModel.find().populate('blogs').exec();
    }

    /**
     * Retrieves a user by their ID.
     * @param id - The ID of the user to retrieve.
     * @returns {Promise<User | null>} The retrieved user, or null if not found.
     */
    async findOne(id: string): Promise<User | null> {
        return await this.userModel.findById(id).populate('blogs').exec();
    }

    /**
     * Retrieves a user by their email.
     * @param email - The email of the user to retrieve.
     * @returns {Promise<User | null>} The retrieved user, or null if not found.
     */
    async findOneByEmail(email: string): Promise<User | null> {
        const user = await this.userModel.findOne({ email }).populate('blogs').exec();
        return user;
    }

    /**
     * Updates a user's blogs array by adding or removing a blog ID.
     * @param userId - The ID of the user to update.
     * @param blogId - The ID of the blog to add or remove.
     * @param operationType - The operation to perform ('add' or 'remove').
     * @returns {Promise<void>}
     */
    async updateUserBlogs(userId: string, blogId: string, operationType: 'add' | 'remove'): Promise<void> {
        try {
            if (operationType === 'add') {
                await this.userModel.findByIdAndUpdate(userId, {
                    $push: { blogs: blogId },
                });
            } else {
                await this.userModel.findByIdAndUpdate(userId, {
                    $pull: { blogs: blogId },
                });
            }
        } catch (error) {
            this.logger.error('Failed to update user blogs: ' + error.message);
            throw new InternalServerErrorException('Failed to update user blogs: ' + error.message);
        }
    }
}
