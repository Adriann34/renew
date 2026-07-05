import type { Grade } from "@prisma/client";

export const gradeColor: Record<Grade, string> = {
  A: "text-pass border-pass",
  B: "text-amber border-amber",
  C: "text-danger border-danger",
};

export const gradeLabel: Record<Grade, string> = {
  A: "Like New",
  B: "Good",
  C: "Fair",
};

export const gradeDot: Record<Grade, string> = {
  A: "bg-pass",
  B: "bg-amber",
  C: "bg-danger",
};
