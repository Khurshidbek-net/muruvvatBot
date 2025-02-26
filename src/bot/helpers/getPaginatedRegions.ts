import { Any } from "typeorm";
import { regions } from "../menus/generous-menu";

const PAGE_SIZE = 5; 

export function getPaginatedRegions(page: number): { text: string; callback_data: string }[][] {
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginated = regions.slice(startIndex, startIndex + PAGE_SIZE);

  const navigationButtons: { text: string; callback_data: string }[] = [];
  if (startIndex + PAGE_SIZE < regions.length) {
    navigationButtons.push({ text: "▶️ Keyingi", callback_data: `page_${page + 1}` });
  }
  if (page > 1) {
    navigationButtons.unshift({ text: "◀️ Oldingi", callback_data: `page_${page - 1}` });
  }
  const backButton = [{ text: "🔙 Orqaga", callback_data: "back_from_regions" }];

  return [...paginated, navigationButtons.length > 0 ? navigationButtons : [], backButton];
}
