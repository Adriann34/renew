"use client";

import { useActionState, useState } from "react";
import type { Category } from "@prisma/client";
import { createListingAction, type CreateListingState } from "@/app/sell/actions";
import { LocationAutocomplete } from "@/components/listing/LocationAutocomplete";
import {
  PhotoWorkspace,
  getPhotoCategoriesForTier,
  emptyPhotosState,
  type PhotosState,
} from "@/components/listing/PhotoWorkspace";
import { ListingPreviewCard, type PreviewFields } from "@/components/listing/ListingPreviewCard";
import {
  categoryDiagnosticTier,
  categorySpecPlaceholder,
  categoryTitlePlaceholder,
} from "@/lib/category";
import { gradeLabel as conditionLabels } from "@/lib/grade";

const initialState: CreateListingState = { error: null };

const inputClass =
  "w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors";
const labelClass = "block text-[12px] text-ink-dim mb-1.5";

const initialFields: PreviewFields = {
  title: "",
  price: "",
  spec: "",
  location: "",
  grade: null,
  benchmarkLabel: "",
  benchmarkScore: "",
  wattageDraw: "",
  bootVerified: false,
};

export function CreateListingForm({ category }: { category: Category }) {
  const [state, formAction, isPending] = useActionState(createListingAction, initialState);
  const [photos, setPhotos] = useState<PhotosState>(emptyPhotosState);
  const [fields, setFields] = useState<PreviewFields>(initialFields);

  function patchFields(patch: Partial<PreviewFields>) {
    setFields((f) => ({ ...f, ...patch }));
  }

  const tier = categoryDiagnosticTier[category];
  const hasBenchmark = tier === "full";
  const hasWattage = tier === "full" || tier === "wattage-boot";
  const photoCategories = getPhotoCategoriesForTier(tier);

  const flatPhotos = photoCategories.flatMap((c) => photos[c.key]);
  const filledCategories = photoCategories.filter((c) => photos[c.key].length > 0).length;

  return (
    <form action={formAction}>
      <input type="hidden" name="category" value={category} />

      {state.error && (
        <p className="text-[13px] text-danger border border-danger/40 bg-danger/5 px-4 py-3 mb-6">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <aside className="space-y-6 w-full">
          <PhotoWorkspace
            tier={tier}
            photos={photos}
            onPhotosChange={(key, files) => setPhotos((p) => ({ ...p, [key]: files }))}
          />

          <div className="flex items-center gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal">Live preview</p>
            <div className="flex-1 h-px bg-line" />
          </div>

          <ListingPreviewCard
            fields={fields}
            photos={flatPhotos}
            filledCategories={filledCategories}
            totalCategories={photoCategories.length}
          />
        </aside>

        <div className="space-y-6 min-w-0">
          <section className="border border-line bg-bg-elevated p-6 space-y-5">
            <h2 className="font-display font-medium text-[15px]">Basics</h2>

            <div>
              <label htmlFor="title" className={labelClass}>
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder={categoryTitlePlaceholder[category]}
                className={inputClass}
                onChange={(e) => patchFields({ title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="price" className={labelClass}>
                Price ($)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                required
                placeholder="1450"
                className={inputClass}
                onChange={(e) => patchFields({ price: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="spec" className={labelClass}>
                Spec
              </label>
              <input
                id="spec"
                name="spec"
                type="text"
                required
                placeholder={categorySpecPlaceholder[category]}
                className={inputClass}
                onChange={(e) => patchFields({ spec: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="location" className={labelClass}>
                Location
              </label>
              <LocationAutocomplete name="location" onValueChange={(value) => patchFields({ location: value })} />
            </div>

            <div>
              <span className={labelClass}>Condition</span>
              <div className="grid grid-cols-3 gap-2">
                {(["A", "B", "C"] as const).map((g) => (
                  <div key={g}>
                    <input
                      type="radio"
                      id={`grade-${g}`}
                      name="grade"
                      value={g}
                      required
                      className="peer sr-only"
                      onChange={() => patchFields({ grade: g })}
                    />
                    <label
                      htmlFor={`grade-${g}`}
                      className="block text-center px-3 py-2 border border-line bg-bg-inset text-ink-dim text-[13px] font-medium cursor-pointer transition-colors peer-checked:bg-amber peer-checked:text-bg-inset peer-checked:border-amber"
                    >
                      {conditionLabels[g]}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                maxLength={2000}
                rows={5}
                placeholder="Describe your item — what's included, why you're selling, any quirks worth mentioning."
                className={inputClass + " h-auto py-2 resize-y"}
              />
            </div>
          </section>

          <section className="border border-line bg-bg-elevated p-6 space-y-5">
            <h2 className="font-display font-medium text-[15px]">Diagnostic report</h2>

            {hasBenchmark && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="benchmarkLabel" className={labelClass}>
                    Benchmark name
                  </label>
                  <input
                    id="benchmarkLabel"
                    name="benchmarkLabel"
                    type="text"
                    required
                    placeholder="Time Spy"
                    className={inputClass}
                    onChange={(e) => patchFields({ benchmarkLabel: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="benchmarkScore" className={labelClass}>
                    Benchmark score
                  </label>
                  <input
                    id="benchmarkScore"
                    name="benchmarkScore"
                    type="number"
                    min={0}
                    required
                    placeholder="18340"
                    className={inputClass}
                    onChange={(e) => patchFields({ benchmarkScore: e.target.value })}
                  />
                </div>
              </div>
            )}

            {hasWattage && (
              <div>
                <label htmlFor="wattageDraw" className={labelClass}>
                  Draw under load (W)
                </label>
                <input
                  id="wattageDraw"
                  name="wattageDraw"
                  type="number"
                  min={0}
                  required
                  placeholder="0 if not applicable"
                  className={inputClass}
                  onChange={(e) => patchFields({ wattageDraw: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-6 pt-1">
              <div>
                <strong className="block text-[14px] text-ink mb-0.5">Boots and POSTs reliably</strong>
                <p className="text-[12px] text-ink-dim max-w-95 leading-snug">
                  Confirms this part powers on and is recognized by the system every time.
                </p>
              </div>
              <label className="relative inline-flex items-center w-10 h-5.5 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  name="bootVerified"
                  className="peer sr-only"
                  onChange={(e) => patchFields({ bootVerified: e.target.checked })}
                />
                <span className="absolute inset-0 border border-line bg-bg-inset transition-colors peer-checked:bg-amber peer-checked:border-amber" />
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-bg-elevated border border-line transition-transform peer-checked:translate-x-4.5 peer-checked:border-amber" />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className={`text-[13px] ${photos.condition.length ? "text-pass font-medium" : "text-ink-dim"}`}>
              {photos.condition.length
                ? "Looks good — condition photos attached."
                : "Add at least one condition photo to publish."}
            </p>
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                disabled
                title="Coming soon"
                className="border border-line text-ink-dim text-[14px] font-medium px-5 h-11 opacity-50 cursor-not-allowed"
              >
                Save draft
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-amber text-bg-inset text-[14px] font-medium px-6 h-11 rounded-(--radius-tag) hover:bg-amber/90 transition-colors disabled:opacity-60"
              >
                {isPending ? "Publishing…" : "Publish listing"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
