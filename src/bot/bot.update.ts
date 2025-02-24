import { Ctx, Hears, On, Start, Update } from "nestjs-telegraf";
import { BotService } from "./bot.service";
import { Context } from "telegraf";


@Update()
export class BotUpdate{
  constructor(private readonly botService: BotService){}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Hears("📝 Ro'yxatdan o'tish")
  async onRegister(@Ctx() ctx: Context) {
    await this.botService.register(ctx);
  }

  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    await this.botService.onContact(ctx);
  }

  @On("location")
  async onLocation(@Ctx() ctx: Context) {
    await this.botService.onLocation(ctx);
  }




  // GENEROUS
  @Hears("Sahiy")
  async onCustomer(@Ctx() ctx: Context) {
    await this.botService.registerGenerous(ctx);
  }












  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }
}