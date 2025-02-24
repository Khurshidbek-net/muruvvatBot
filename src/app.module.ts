import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BOT_NAME } from './app.consts';
import { TelegrafModule } from 'nestjs-telegraf';
import { Generous } from './bot/entities/generous.entity';



@Module({
  imports: [ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    TelegrafModule.forRootAsync({
      botName: BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN || "undefined",
        middlewares: [],
        include: [BotModule],
      })
    }),

    TypeOrmModule.forRoot({
      type:"postgres",
      host: process.env.POSTGRES_HOST,
      username: process.env.POSTGRES_USER,
      port: Number(process.env.POSTGRES_PORT),
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Generous],
      synchronize: true
    }),

    BotModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
