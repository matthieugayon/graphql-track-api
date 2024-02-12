import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LogInDto {
    @IsEmail()
    @MaxLength(250)
    @IsNotEmpty()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    password: string;
}
