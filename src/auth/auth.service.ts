import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from 'util';
import { SignUpDto } from '../users/dto/signup.dto';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
    ) { }

    /**
     * Authenticates a user and generates a JWT access token.
     * @param email - The email of the user trying to sign in.
     * @param password - The password provided by the user.
     * @returns {Promise<{ access_token: string }>} An object containing the access token.
     * @throws {UnauthorizedException} if credentials are invalid.
     */
    async signIn(
        email: string,
        password: string,
    ): Promise<{ access_token: string }> {
        // Find the user
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new BadRequestException("Invalid credentials");
        }
        // Validate password
        if (!(await this.verifyPassword(password, user.password))) {
            throw new UnauthorizedException("Invalid credentials");
        }
        // Generate a token
        const token = this.generateJwtToken(user);
        // Return the token
        return { access_token: token };
    }

    /**
     * Registers a new user, hashes their password, and generates a JWT access token.
     * @param user - The user object containing email and password.
     * @returns {Promise<{access_token: string}>}An object containing the access token.
     * @throws {BadRequestException} if the email is already in use.
     */
    async signUp(user: SignUpDto): Promise<{ access_token: string; }> {
        // See if email is in use
        const existingUser = await this.usersService.findOneByEmail(user.email);
        if (existingUser) {
            throw new BadRequestException("Email already in use");
        }
        // Hash the password
        user.password = await this.hashPassword(user.password);
        // Create a new user
        const newUser = await this.usersService.create(user);
        // Generate a token
        const token = this.generateJwtToken(newUser);
        // Return the token
        return { access_token: token };
    }

    /**
     * Generates a JWT token for a user.
     * @param user - The user object containing email and ID.
     * @returns {string} A JWT access token as a string.
     */
    private generateJwtToken(user: any): string {
        const payload = { email: user.email, sub: user._id };
        return this.jwtService.sign(payload);
    }

    /**
     * hashPassword - function to hash a user password
     * @param password user password to hash
     * @returns {Promise<string>} hashed password
     */
    private async hashPassword(password: string): Promise<string> {
        const salt = randomBytes(8).toString("hex");
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        return salt + "." + hash.toString("hex");
    }

    /**
     * Verifies if the provided password matches the stored hashed password.
     * @param password - The plain text password provided by the user.
     * @param storedPassword - The stored hashed password with salt.
     * @returns {Promise<boolean>} A boolean indicating whether the password is valid.
     */
    public async verifyPassword(password: string, storedPassword: string): Promise<boolean> {
        const [salt, storedHash] = storedPassword.split(".");
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        return storedHash === hash.toString("hex");
    }
}
