import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Generous } from './entities/generous.entity';
import { Repository } from 'typeorm';
import { generousMenu } from './menus/generous-menu';

@Injectable()
export class BotService {
  constructor(
    @InjectRepository(Generous) private readonly generousRepo: Repository<Generous>
  ) { }


  async start(ctx: Context) {
    const user_id = ctx.from?.id;

    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    if (generous.last_state !== 'finish') {
      const lastState = generous.last_state;
      const states = ["name", "phone", "location"];
      const currentState = states.indexOf(lastState);
      const nextState = states[currentState + 1];
      switch (nextState) {
        case "name":
          await ctx.reply("Ismingizni kiriting:")
          break;
        case "phone":
          await ctx.reply("📞 Telefon raqamingizni yuboring:", {
            parse_mode: "HTML",
            ...Markup.keyboard([[Markup.button.contactRequest("📞 Telefon raqamingizni yuborish")]]).resize().oneTime()
          });
          break;
        case "location":
          await ctx.reply("📍 Manzilni yuboring:", {
            parse_mode: "HTML",
            ...Markup.keyboard([[Markup.button.locationRequest("📍 Manzilni yuborish")]]).resize().oneTime()
          });
          break;
      }
    }
  }

  async register(ctx: Context) {
    try {
      await ctx.reply("Ro'yxatdan o'tish uchun quyidagilardan birini tanlang", {
        parse_mode: 'HTML',
        ...Markup.keyboard([["Sahiy", "Sabrli"]])
          .oneTime().resize()
      })
    } catch (error) {
      console.log("Error on register: ", error)
    }
  }

  async onContact(ctx: Context) {
    if ('contact' in ctx.message!) {

      const user_id = ctx.from?.id;
      const generous = await this.generousRepo.findOneBy({ user_id });

      if (!generous) {
        return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
          parse_mode: "HTML",
          ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
        });
      }

      if (ctx.message!.contact.user_id !== user_id) {
        await ctx.reply(`<b>❌ Iltimos, shaxsiy telefon raqamingizni yuboring!</b> `, {
          parse_mode: "HTML",
          ...Markup.keyboard([[Markup.button.contactRequest("📞 Telefon raqamingizni yuborish")]]).resize().oneTime()
        });
      }

      const phone = ctx.message.contact.phone_number;
      await this.generousRepo.update({ user_id }, { phone, last_state: 'location' })
      return await ctx.reply(`Manzilni jo'nating`, {
        parse_mode: "HTML",
        ...Markup.keyboard([[Markup.button.locationRequest("📍 Manzilni yuborish")]]).resize()
      });

    }
  }

  async onLocation(ctx: Context) {
    try {
      if ("location" in ctx.message!) {
        const user_id = ctx.from?.id;
        const generous = await this.generousRepo.findOneBy({ user_id });
        if (!generous) {
          return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
            parse_mode: "HTML",
            ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
          });
        } else {
          if (generous) {
            generous.location = `${ctx.message.location.latitude},${ctx.message.location.longitude}`
            await this.generousRepo.update({ user_id }, { location: generous.location, last_state: 'finish' })
            return await ctx.reply("🏠 Asosiy menyu", generousMenu);
          }
        }
      }
    } catch (error) {
      console.log("OnLocation Error ", error)
    }
  }



  // GENEROUS
  async registerGenerous(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      await this.generousRepo.save({
        user_id,
        username: ctx.from?.username,
        last_state: 'name'
      })
      await ctx.reply("Ismingizni kiriting:")
    } else {
      await ctx.reply("🏠 Asosiy menyu", generousMenu)
    }
  }
























  async onText(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!("text" in ctx.message!)) {
      return;
    }

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    const text = ctx.message.text.trim();

    if (generous) {
      if (generous.last_state === 'finish') {
        await ctx.reply("🏠 Asosiy menyu", generousMenu)
      }
      if (generous.last_state === 'name') {
        await this.generousRepo.update({ user_id }, { name: text, last_state: 'phone' })
        return await ctx.reply("📞 Telefon raqamingizni yuboring:", {
          parse_mode: "HTML",
          ...Markup.keyboard([[Markup.button.contactRequest("📞 Telefon raqamingizni yuborish")]]).resize().oneTime()
        });
      }
    }
  }
}
