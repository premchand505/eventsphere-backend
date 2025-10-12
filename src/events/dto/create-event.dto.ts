import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // The date will come in as an ISO 8601 string

  @IsNumber()
  @Min(0)
  @Type(() => Number) // Transform the incoming value to a number
  price: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number) // Transform the incoming value to a number
  capacity: number;

   // --- ADDITIONS START ---
  @IsString()
  @IsOptional()
  featuring?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
  // --- ADDITIONS END ---
}