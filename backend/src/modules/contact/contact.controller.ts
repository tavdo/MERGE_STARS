import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../../database/entities/contact-message.entity';

class ContactDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() subject: string;
  @IsString() @IsNotEmpty() message: string;
}

@Controller('contact')
export class ContactController {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly messages: Repository<ContactMessage>,
  ) {}

  @Post('messages')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async send(@Body() dto: ContactDto) {
    const row = this.messages.create(dto);
    await this.messages.save(row);
    return { ok: true, id: row.id };
  }
}
