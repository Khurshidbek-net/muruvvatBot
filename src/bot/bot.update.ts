import { Action, Ctx, Hears, On, Start, Update } from "nestjs-telegraf";
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

  @Hears("🤲 Muruvvat qilish")
  async onDonate(@Ctx() ctx: Context) {
    await this.botService.onDonate(ctx);
  }

  @Hears("👤 Istalgan odamga")
  async onAnyPerson(@Ctx() ctx: Context) {
    await this.botService.onAnyPerson(ctx);
  }

  @Hears("⬅ Orqaga")
  async OnBackFromDonation(@Ctx() ctx: Context) {
    await this.botService.OnBackFromDonation(ctx);
  }

  @Hears("📞 Admin bilan bog’lanish")
  async OnContactWithAdmin(@Ctx() ctx: Context) {
    await this.botService.OnContactWithAdmin(ctx);
  }

  @Hears("😌 Sabrlilarni ko’rish")
  async OnViewAllPatients(@Ctx() ctx: Context) {
    await this.botService.OnViewAllPatients(ctx);
  }

  @Hears("⚙️ Sozlamalar")
  async OnSettings(@Ctx() ctx: Context) {
    await this.botService.OnSettings(ctx);
  }

  @Action("yes")
  async onYes(@Ctx() ctx: Context) {
    await this.botService.onYes(ctx);
  }

  @Action("no")
  async onNo(@Ctx() ctx: Context) {
    await this.botService.onNo(ctx);
  }

  @Action("all_patients")
  async onClickAllPatients(@Ctx() ctx: Context) {
    await this.botService.onClickAllPatients(ctx);
  }

  @Action("by_region")
  async onClickPatientsByRegion(@Ctx() ctx: Context) {
    await this.botService.onClickPatientsByRegion(ctx);
  }

  @Action(/^viloyat_(\w+)$/)
  async onClickRegion(@Ctx() ctx: Context) {
    await this.botService.onClickRegion(ctx);
  }

  @Action("back_from_regions")
  async onClickBackFromRegions(@Ctx() ctx: Context) {
    await this.botService.onClickBackFromRegions(ctx);
  }

  @Action(/^page_(\d+)$/)
  async onClickPage(@Ctx() ctx) {
    const page = parseInt(ctx.match[1]);
    await this.botService.onClickPatientsByRegion(ctx, page);
  }

  @Action("back")
  async onClickBack(@Ctx() ctx: Context) {
    await this.botService.onClickBack(ctx);
  }














  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }
}