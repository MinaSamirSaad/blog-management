import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class SignUpDto {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @MaxLength(30, { message: 'Name must be less than 30 characters' })
    @MinLength(3, { message: 'Name must be at least 3 characters' })
    @ApiProperty({
        example: 'John',
        required: true,
        description: 'A valid name',
        maxLength: 30,
        minLength: 3,
    })
    name: string;

    @IsEmail({}, { message: 'Invalid email' })
    @IsNotEmpty({ message: 'Email is required' })
    @ApiProperty({
        example: 'test@test.com',
        required: true,
        description: 'A valid email address',
    })
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @IsStrongPassword({ minLowercase: 2, minUppercase: 1, minNumbers: 2, minSymbols: 1 }, { message: 'Password is weak' })
    @ApiProperty({
        example: 'Password123!',
        required: true,
        description: 'A strong password with at least 2 lowercase, 1 uppercase, 2 numbers, and 1 symbol',
        minLength: 8,
        type: 'string',
    })
    password: string;
}
