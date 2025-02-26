import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Generous } from './entities/generous.entity';
import { In, Repository } from 'typeorm';
import { generousMenu, regions } from './menus/generous-menu';
import { getPaginatedRegions } from './helpers/getPaginatedRegions';

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

  async onDonate(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    return await ctx.reply("Kimga muruvvat qilmoqchisiz?", {
      ...Markup.keyboard([["👤 Istalgan odamga"],["⬅ Orqaga"]]).resize().oneTime()
    })
  }

  async onAnyPerson(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    generous.last_state = 'donating';
    await this.generousRepo.update({ user_id }, { last_state: generous.last_state })
    return await ctx.reply("Bermoqchi bo'lgan narsalaringizni kiriting:")
  }

  async onYes(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    await ctx.editMessageText("Muruvatingiz uchun rahmat.\nTez orada adminlarimiz siz bilan bog'lanishadi.")
    return await ctx.reply("🏠 Asosiy menyu", generousMenu)
  }

  async onNo(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }
    await ctx.deleteMessage();
    return await ctx.reply("🏠 Asosiy menyu", generousMenu);
  }

  async OnBackFromDonation(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    await ctx.reply("🏠 Asosiy menyu", generousMenu)
  }

  async OnContactWithAdmin(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    generous.last_state = 'contact_admin';
    await this.generousRepo.update({ user_id }, { last_state: generous.last_state })
    return await ctx.reply("Adminga xabaringizni qoldirishingiz mumkin");
  }

  async OnViewAllPatients(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    return await ctx.reply("Kerakli bo'limni tanlang:",{
      reply_markup:{
        inline_keyboard:[
          [{ text: "👥 Barcha sabrlillar", callback_data: "all_patients" }, { text: "📍 Hudud bo'yicha", callback_data: "by_region"}],
          [{ text: "⬅ Orqaga", callback_data: "back"}] 
        ]
      }
    })
  }

  async onClickAllPatients(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    return await ctx.editMessageText("Hozircha sabrlilar mavjud emas")
  }

  async onClickPatientsByRegion(ctx: Context, page = 1) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    const keyboard = getPaginatedRegions(page);

    await ctx.answerCbQuery();
    return await ctx.editMessageText("Kerakli viloyatni tanlang:",{
      reply_markup:{
        inline_keyboard: keyboard
      }
    })
  }

  async onClickBackFromRegions(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    return await ctx.editMessageText("Kerakli bo'limni tanlang:",{
      reply_markup:{
        inline_keyboard:[
          [{ text: "👥 Barcha sabrlillar", callback_data: "all_patients" }, {
            text: "📍 Hudud bo'yicha", callback_data: "by_region"
          }],
          [{ text: "⬅ Orqaga", callback_data: "back"}]
        ]
      }
    })
  }

  async onClickBack(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }
    await ctx.deleteMessage();
    return await ctx.reply("🏠 Asosiy menyu", generousMenu)
  }

  async OnSettings(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }

    return await ctx.reply("Bu bo'limda sozlamalarni o'zgartirishingiz mumkin");
  }

  async onClickRegion(ctx: Context) {
    const user_id = ctx.from?.id;
    const generous = await this.generousRepo.findOneBy({ user_id });

    if (!generous) {
      return await ctx.reply(`⚠️ Botdan foydalanish uchun, iltimos ro'yxatdan o'ting`, {
        parse_mode: "HTML",
        ...Markup.keyboard([["📝 Ro'yxatdan o'tish"]]).resize().oneTime()
      });
    }
    return await ctx.editMessageText("Bu sahifa hozircha mavjud emas");
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
        return await ctx.reply("🏠 Asosiy menyu", generousMenu)
      }
      if (generous.last_state === 'name') {
        await this.generousRepo.update({ user_id }, { name: text, last_state: 'phone' })
        return await ctx.reply("📞 Telefon raqamingizni yuboring:", {
          parse_mode: "HTML",
          ...Markup.keyboard([[Markup.button.contactRequest("📞 Telefon raqamingizni yuborish")]]).resize().oneTime()
        });
      }

      if (generous.last_state === 'donating') {
        generous.donations = text;
        generous.last_state = 'finish';
        await this.generousRepo.update({ user_id }, { donations: generous.donations, last_state: generous.last_state })
        return await ctx.reply("Tasdiqlaysizmi?", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅", callback_data: "yes" }, { text: "❌", callback_data: "no" }]
            ]
          }
        })
      }

      if (generous.last_state === 'contact_admin') {
        generous.last_state = 'finish';
        await this.generousRepo.update({ user_id }, { last_state: generous.last_state })
        await ctx.reply("✅ Adminga xabaringiz muvaffaqiyatli yetkazildi. \nSiz bilan adminlarimiz bog'lanishadi.")
        return await ctx.reply("🏠 Asosiy menyu", generousMenu)
      }
    }
  }
}
