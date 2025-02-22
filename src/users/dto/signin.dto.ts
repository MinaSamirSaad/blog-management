import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";

export class SignInDto {
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
    @MinLength(8, { message: 'Password does not meet the required security standards' })
    @IsStrongPassword({ minLowercase: 2, minUppercase: 1, minNumbers: 2, minSymbols: 1 }, { message: 'Password does not meet the required security standards.' })
    @ApiProperty({
        example: 'Password123!',
        required: true,
        description: 'A strong password with at least 2 lowercase, 1 uppercase, 2 numbers, and 1 symbol',
        minLength: 8,
        type: 'string',
    })
    password: string;
}
