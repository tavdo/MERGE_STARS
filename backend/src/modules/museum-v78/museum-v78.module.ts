import { Module } from '@nestjs/common';
import { MuseumV78Service } from './museum-v78.service';
import { MuseumV78Controller } from './museum-v78.controller';

@Module({ controllers: [MuseumV78Controller], providers: [MuseumV78Service] })
export class MuseumV78Module {}
