export type Grade = "A" | "B" | "C";

export type Listing = {
  id: string;
  title: string;
  category: "GPU" | "CPU" | "Motherboard" | "RAM" | "Storage" | "PSU";
  price: number;
  grade: Grade;
  vramOrSpec: string;
  benchmarkScore: number;
  benchmarkLabel: string;
  wattageDraw: number;
  hoursUsed: number;
  seller: string;
  location: string;
  bootVerified: boolean;
};

export const listings: Listing[] = [
  {
    id: "gpu-4090-01",
    title: "RTX 4090 Founders Edition",
    category: "GPU",
    price: 12400,
    grade: "A",
    vramOrSpec: "24GB GDDR6X",
    benchmarkScore: 35120,
    benchmarkLabel: "Time Spy",
    wattageDraw: 411,
    hoursUsed: 2100,
    seller: "kjetil_hw",
    location: "Oslo",
    bootVerified: true,
  },
  {
    id: "gpu-3080ti-02",
    title: "RTX 3080 Ti",
    category: "GPU",
    price: 5200,
    grade: "B",
    vramOrSpec: "12GB GDDR6X",
    benchmarkScore: 18340,
    benchmarkLabel: "Time Spy",
    wattageDraw: 350,
    hoursUsed: 6400,
    seller: "silicon_surplus",
    location: "Bergen",
    bootVerified: true,
  },
  {
    id: "gpu-7900xtx-03",
    title: "RX 7900 XTX",
    category: "GPU",
    price: 8100,
    grade: "A",
    vramOrSpec: "24GB GDDR6",
    benchmarkScore: 29870,
    benchmarkLabel: "Time Spy",
    wattageDraw: 355,
    hoursUsed: 900,
    seller: "nordic_teardown",
    location: "Trondheim",
    bootVerified: true,
  },
  {
    id: "cpu-7800x3d-04",
    title: "Ryzen 7 7800X3D",
    category: "CPU",
    price: 3400,
    grade: "A",
    vramOrSpec: "8C/16T · 5.0GHz boost",
    benchmarkScore: 14210,
    benchmarkLabel: "Cinebench R23",
    wattageDraw: 120,
    hoursUsed: 1500,
    seller: "kjetil_hw",
    location: "Oslo",
    bootVerified: true,
  },
  {
    id: "gpu-3070-05",
    title: "RTX 3070",
    category: "GPU",
    price: 2600,
    grade: "C",
    vramOrSpec: "8GB GDDR6",
    benchmarkScore: 12960,
    benchmarkLabel: "Time Spy",
    wattageDraw: 240,
    hoursUsed: 11200,
    seller: "gamut_gear",
    location: "Stavanger",
    bootVerified: true,
  },
  {
    id: "psu-1000w-06",
    title: "Corsair RM1000x PSU",
    category: "PSU",
    price: 950,
    grade: "A",
    vramOrSpec: "1000W · 80+ Gold",
    benchmarkScore: 100,
    benchmarkLabel: "Load Test Pass",
    wattageDraw: 0,
    hoursUsed: 3000,
    seller: "nordic_teardown",
    location: "Trondheim",
    bootVerified: true,
  },
];

export const categories = [
  { label: "All listings", count: 482 },
  { label: "GPUs", count: 214 },
  { label: "CPUs", count: 96 },
  { label: "Motherboards", count: 58 },
  { label: "RAM", count: 71 },
  { label: "Storage", count: 63 },
  { label: "PSUs", count: 40 },
];
