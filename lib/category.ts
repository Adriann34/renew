import type { Category } from "@prisma/client";

export const categoryOrder: Category[] = [
  "GPU",
  "CPU",
  "MOTHERBOARD",
  "RAM",
  "STORAGE",
  "PSU",
  "OTHER",
];

export const categoryLabels: Record<Category, string> = {
  GPU: "GPU",
  CPU: "CPU",
  MOTHERBOARD: "Motherboard",
  RAM: "RAM",
  STORAGE: "Storage",
  PSU: "PSU",
  OTHER: "Other",
};

export const categoryPluralLabels: Record<Category, string> = {
  GPU: "GPUs",
  CPU: "CPUs",
  MOTHERBOARD: "Motherboards",
  RAM: "RAM",
  STORAGE: "Storage",
  PSU: "PSUs",
  OTHER: "Other",
};

// How much of the diagnostic report a category's create-listing form collects:
//  - "full": benchmark name + score, draw under load, boots/POSTs
//  - "wattage-boot": draw under load + boots/POSTs (no benchmark — CPUs/PSUs
//    aren't shopped by a single agreed-upon benchmark the way GPUs are)
//  - "boot-only": boots/POSTs only (no wattage, no benchmark — these parts
//    don't have a meaningful "draw under load" a seller can test)
export type DiagnosticTier = "full" | "wattage-boot" | "boot-only";

export const categoryDiagnosticTier: Record<Category, DiagnosticTier> = {
  GPU: "full",
  CPU: "wattage-boot",
  PSU: "wattage-boot",
  MOTHERBOARD: "boot-only",
  RAM: "boot-only",
  STORAGE: "boot-only",
  OTHER: "boot-only",
};

export const categorySpecPlaceholder: Record<Category, string> = {
  GPU: "24GB GDDR6X",
  CPU: "8C/16T · 5.0GHz boost",
  MOTHERBOARD: "AM5 · ATX",
  RAM: "32GB DDR5 6000",
  STORAGE: "2TB NVMe",
  PSU: "1000W · 80+ Gold",
  OTHER: "Key specs",
};

export const categoryTitlePlaceholder: Record<Category, string> = {
  GPU: "RTX 4090 Founders Edition",
  CPU: "Ryzen 7 7800X3D",
  MOTHERBOARD: "ASUS ROG Strix X670E-E",
  RAM: "Corsair Dominator Platinum",
  STORAGE: "Samsung 990 Pro",
  PSU: "Corsair RM1000x",
  OTHER: "Item name",
};

// URL slugs are just the lowercased enum value ("gpu", "motherboard", ...),
// so a Category can always be recovered with `slug.toUpperCase()`.
export function categoryFromSlug(slug: string): Category | null {
  const upper = slug.toUpperCase();
  return (categoryOrder as string[]).includes(upper) ? (upper as Category) : null;
}
