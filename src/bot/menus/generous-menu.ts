import { Markup } from "telegraf";

export const generousMenu = Markup.keyboard([
  ['🤲 Muruvvat qilish', '😌 Sabrlilarni ko’rish'],
  ['📞 Admin bilan bog’lanish', '⚙️ Sozlamalar']
]).resize().oneTime();

export const regions: { text: string; callback_data: string }[][] = [
  [{ text: 'Toshkent shahri', callback_data: 'viloyat_tashkentshahri' }],
  [{ text: 'Toshkent viloyati', callback_data: 'viloyat_tashkent' }],
  [{ text: 'Andijon viloyati', callback_data: 'viloyat_andijon' }],
  [{ text: 'Buxoro viloyati', callback_data: 'viloyat_buxoro'}],
  [{ text: 'Jizzax viloyati', callback_data: 'viloyat_jizzax' }],
  [{ text: 'Qashqadaryo viloyati', callback_data: 'viloyat_qashqadaryo' }],
  [{ text: 'Navoiy viloyati', callback_data: 'viloyat_navoiy' }],
  [{ text: 'Namangan viloyati', callback_data: 'viloyat_namangan' }],
  [{ text: 'Samarqand viloyati', callback_data: 'viloyat_samarqand' }],
  [{ text: 'Surxondaryo viloyati', callback_data: 'viloyat_surxondaryo' }],
  [{ text: 'Sirdaryo viloyati', callback_data: 'viloyat_sirdaryo' }],
  [{ text: 'Fargona viloyati', callback_data: 'viloyat_fargona' }],
  [{ text: 'Xorazm viloyati', callback_data: 'viloyat_xorazm' }],
]