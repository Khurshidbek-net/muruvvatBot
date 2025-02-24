import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Generous } from './entities/generous.entity';
import { BotUpdate } from './bot.update';

@Module({
  imports: [TypeOrmModule.forFeature([Generous])],
  providers: [BotUpdate, BotService],
})
export class BotModule {}
