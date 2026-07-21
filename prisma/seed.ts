import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sellers = [
  { id: "seed-user-kjetil-hw", email: "kjetil_hw@seed.renew.local", name: "kjetil_hw" },
  { id: "seed-user-silicon-surplus", email: "silicon_surplus@seed.renew.local", name: "silicon_surplus" },
  { id: "seed-user-nordic-teardown", email: "nordic_teardown@seed.renew.local", name: "nordic_teardown" },
  { id: "seed-user-gamut-gear", email: "gamut_gear@seed.renew.local", name: "gamut_gear" },
];

const listings = [
  {
    id: "seed-listing-gpu-4090-01",
    title: "RTX 4090 Founders Edition",
    category: "GPU" as const,
    price: 15900,
    currency: "NOK",
    grade: "A" as const,
    spec: "24GB GDDR6X",
    location: "Oslo, Norway",
    description:
      "Upgraded to a new rig and no longer need this. Runs cool, no mining history, original box included.",
    benchmarkScore: 35120,
    benchmarkLabel: "Time Spy",
    wattageDraw: 411,
    bootVerified: true,
    sellerId: "seed-user-kjetil-hw",
    photo: "/demo/rtx-4090.jpg",
  },
  {
    id: "seed-listing-gpu-3080ti-02",
    title: "RTX 3080 Ti",
    category: "GPU" as const,
    price: 550,
    grade: "B" as const,
    spec: "12GB GDDR6X",
    location: "Austin, USA",
    description:
      "Solid daily driver, some light wear on the shroud. Selling as part of a full system teardown.",
    benchmarkScore: 18340,
    benchmarkLabel: "Time Spy",
    wattageDraw: 350,
    bootVerified: true,
    sellerId: "seed-user-silicon-surplus",
    photo: "/demo/rtx-3080ti.jpg",
  },
  {
    id: "seed-listing-gpu-7900xtx-03",
    title: "RX 7900 XTX",
    category: "GPU" as const,
    price: 7900,
    currency: "SEK",
    grade: "A" as const,
    spec: "24GB GDDR6",
    location: "Stockholm, Sweden",
    description:
      "Barely used, mostly ran productivity workloads rather than gaming. Comes with original packaging.",
    benchmarkScore: 29870,
    benchmarkLabel: "Time Spy",
    wattageDraw: 355,
    bootVerified: true,
    sellerId: "seed-user-nordic-teardown",
    photo: "/demo/rx-7900xtx.jpg",
  },
  {
    id: "seed-listing-cpu-7800x3d-04",
    title: "Ryzen 7 7800X3D",
    category: "CPU" as const,
    price: 3500,
    currency: "NOK",
    grade: "A" as const,
    spec: "8C/16T · 5.0GHz boost",
    location: "Oslo, Norway",
    description:
      "Great gaming CPU, upgrading to a higher core count for streaming. No delidding, never overclocked.",
    benchmarkScore: 14210,
    benchmarkLabel: "Cinebench R23",
    wattageDraw: 120,
    bootVerified: true,
    sellerId: "seed-user-kjetil-hw",
    photo: "/demo/ryzen-7800x3d.jpg",
  },
  {
    id: "seed-listing-gpu-3070-05",
    title: "RTX 3070",
    category: "GPU" as const,
    price: 260,
    currency: "EUR",
    grade: "C" as const,
    spec: "8GB GDDR6",
    location: "Berlin, Germany",
    description:
      "Heavily used mining card, still fully functional but priced accordingly. Tested stable under load.",
    benchmarkScore: 12960,
    benchmarkLabel: "Time Spy",
    wattageDraw: 240,
    bootVerified: true,
    sellerId: "seed-user-gamut-gear",
    photo: "/demo/rtx-3070.jpg",
  },
  {
    id: "seed-listing-psu-1000w-06",
    title: "Corsair RM1000x PSU",
    category: "PSU" as const,
    price: 1000,
    currency: "SEK",
    grade: "A" as const,
    spec: "1000W · 80+ Gold",
    location: "Stockholm, Sweden",
    description:
      "Downsized to a smaller build and don't need this much wattage anymore. All cables included.",
    benchmarkScore: 100,
    benchmarkLabel: "Load Test Pass",
    wattageDraw: 0,
    bootVerified: true,
    sellerId: "seed-user-nordic-teardown",
    photo: "/demo/corsair-rm1000x.jpg",
  },
];

async function main() {
  for (const seller of sellers) {
    await prisma.user.upsert({
      where: { id: seller.id },
      update: {},
      create: seller,
    });
  }

  for (const { photo, ...listing } of listings) {
    await prisma.listing.upsert({
      where: { id: listing.id },
      update: listing,
      create: listing,
    });

    // One CONDITION proof photo per seed listing. Deterministic id so re-running
    // the seed updates the same row instead of piling up duplicates.
    await prisma.listingPhoto.upsert({
      where: { id: `${listing.id}-photo-condition` },
      update: { url: photo },
      create: {
        id: `${listing.id}-photo-condition`,
        listingId: listing.id,
        kind: "CONDITION",
        url: photo,
      },
    });
  }

  console.log(`Seeded ${sellers.length} users and ${listings.length} listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
