import { NextResponse } from "next/server";
import { City, Country } from "country-state-city";

let cityLabelsCache: string[] | null = null;

function getCityLabels(): string[] {
  if (cityLabelsCache) return cityLabelsCache;

  const countryNameByCode = new Map(
    Country.getAllCountries().map((c) => [c.isoCode, c.name])
  );

  cityLabelsCache = City.getAllCities().map(
    (c) => `${c.name}, ${countryNameByCode.get(c.countryCode) ?? c.countryCode}`
  );

  return cityLabelsCache;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const matches = getCityLabels().filter((label) => label.toLowerCase().includes(q));

  matches.sort((a, b) => {
    const aStarts = a.toLowerCase().startsWith(q);
    const bStarts = b.toLowerCase().startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.length - b.length;
  });

  return NextResponse.json({ results: matches.slice(0, 8) });
}
