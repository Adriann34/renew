import { Category, type Grade } from "@prisma/client";
import { categoryDiagnosticTier } from "@/lib/category";
import { isSupportedCurrency } from "@/lib/currency";

export const MAX_TITLE_LEN = 120;
export const MAX_SPEC_LEN = 120;
export const MAX_LOCATION_LEN = 120;
export const MAX_DESCRIPTION_LEN = 2000;
export const MAX_BENCHMARK_LABEL_LEN = 60;
// Currency-relative: the cap is generous enough for weaker-unit currencies (e.g.
// millions of IDR/KRW for a high-value part), since `price` is in the listing's
// own currency, not USD.
export const MAX_PRICE = 1_000_000_000;
export const MAX_WATTAGE = 5000;
export const MAX_BENCHMARK_SCORE = 10_000_000;

export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function num(formData: FormData, key: string): number {
  const value = formData.get(key);
  return typeof value === "string" ? Number(value) : NaN;
}

export type ListingFields = {
  title: string;
  category: Category;
  price: number;
  currency: string;
  grade: Grade;
  spec: string;
  location: string;
  description: string;
  bootVerified: boolean;
  benchmarkLabel: string;
  benchmarkScore: number;
  wattageDraw: number;
};

/** Shared field parsing + validation for both create and edit listing forms — keeps the two server actions from drifting apart on what counts as a valid listing. */
export function parseListingFields(formData: FormData): { fields: ListingFields } | { error: string } {
  const title = str(formData, "title");
  const categoryRaw = str(formData, "category");
  const price = num(formData, "price");
  const currency = str(formData, "currency");
  const spec = str(formData, "spec");
  const location = str(formData, "location");
  const description = str(formData, "description");
  const gradeRaw = str(formData, "grade");
  const bootVerified = formData.get("bootVerified") === "on";

  if (!title || !categoryRaw || !spec || !location || !description || !gradeRaw) {
    return { error: "Please fill in all required fields." };
  }
  if (!Object.values(Category).includes(categoryRaw as Category)) {
    return { error: "Please choose a valid category." };
  }
  if (gradeRaw !== "A" && gradeRaw !== "B" && gradeRaw !== "C") {
    return { error: "Please choose a valid condition." };
  }
  if (!isSupportedCurrency(currency)) {
    return { error: "Please choose a valid currency." };
  }

  const tier = categoryDiagnosticTier[categoryRaw as Category];
  const hasBenchmark = tier === "full";
  const hasWattage = tier === "full" || tier === "wattage-boot";

  const benchmarkLabel = hasBenchmark ? str(formData, "benchmarkLabel") : "";
  const benchmarkScore = hasBenchmark ? num(formData, "benchmarkScore") : 0;
  const wattageDraw = hasWattage ? num(formData, "wattageDraw") : 0;

  if (hasBenchmark && !benchmarkLabel) {
    return { error: "Please fill in all required fields." };
  }
  if (
    Number.isNaN(price) ||
    (hasBenchmark && Number.isNaN(benchmarkScore)) ||
    (hasWattage && Number.isNaN(wattageDraw))
  ) {
    return { error: "Price, benchmark score, and wattage draw must be numbers." };
  }
  if (price < 0 || price > MAX_PRICE) {
    return { error: `Price is out of range.` };
  }
  if (hasWattage && (wattageDraw < 0 || wattageDraw > MAX_WATTAGE)) {
    return { error: `Wattage draw must be between 0 and ${MAX_WATTAGE}.` };
  }
  if (hasBenchmark && (benchmarkScore < 0 || benchmarkScore > MAX_BENCHMARK_SCORE)) {
    return { error: "Benchmark score is out of range." };
  }
  if (
    title.length > MAX_TITLE_LEN ||
    spec.length > MAX_SPEC_LEN ||
    location.length > MAX_LOCATION_LEN ||
    description.length > MAX_DESCRIPTION_LEN ||
    benchmarkLabel.length > MAX_BENCHMARK_LABEL_LEN
  ) {
    return { error: "One or more fields exceed their maximum length." };
  }

  return {
    fields: {
      title,
      category: categoryRaw as Category,
      price,
      currency,
      grade: gradeRaw as Grade,
      spec,
      location,
      description,
      bootVerified,
      benchmarkLabel,
      benchmarkScore,
      wattageDraw,
    },
  };
}
