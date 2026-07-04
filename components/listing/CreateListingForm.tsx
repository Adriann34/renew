"use client";

import { useActionState } from "react";
import { Category, type Grade } from "@prisma/client";
import { createListingAction, type CreateListingState } from "@/app/sell/actions";
import { LocationAutocomplete } from "@/components/listing/LocationAutocomplete";

const initialState: CreateListingState = { error: null };

const categoryLabels: Record<Category, string> = {
  GPU: "GPU",
  CPU: "CPU",
  MOTHERBOARD: "Motherboard",
  RAM: "RAM",
  STORAGE: "Storage",
  PSU: "PSU",
  OTHER: "Other",
};

const conditionLabels: Record<Grade, string> = {
  A: "Like New",
  B: "Good",
  C: "Fair",
};

const inputClass =
  "w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors";
const labelClass = "block text-[12px] text-ink-dim mb-1.5";
const fileInputClass =
  "w-full text-[13px] text-ink-dim file:mr-3 file:border file:border-line file:bg-bg-inset file:px-3 file:h-9 file:text-[13px] file:text-ink file:cursor-pointer";

export function CreateListingForm() {
  const [state, formAction, isPending] = useActionState(createListingAction, initialState);

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <p className="text-[13px] text-danger border border-danger/40 bg-danger/5 px-4 py-3">
          {state.error}
        </p>
      )}

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
            placeholder="RTX 4090 Founders Edition"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>
                Select category
              </option>
              {Object.values(Category).map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
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
            />
          </div>
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
            placeholder="24GB GDDR6X"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <LocationAutocomplete name="location" />
        </div>

        <div>
          <span className={labelClass}>Condition</span>
          <div className="flex gap-5">
            {(["A", "B", "C"] as const).map((g) => (
              <label key={g} className="flex items-center gap-2 text-[14px] text-ink">
                <input type="radio" name="grade" value={g} required className="accent-amber" />
                {conditionLabels[g]}
              </label>
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
            />
          </div>
        </div>

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
          />
        </div>

        <label className="flex items-center gap-2 text-[14px] text-ink">
          <input type="checkbox" name="bootVerified" className="accent-amber" />
          Boots and POSTs reliably
        </label>
      </section>

      <section className="border border-line bg-bg-elevated p-6 space-y-5">
        <h2 className="font-display font-medium text-[15px]">Photo proof</h2>
        <p className="text-ink-dim text-[13px]">
          Back up your condition and benchmark numbers — listings with proof
          sell faster. Photos are compressed automatically, so feel free to
          upload full-size images.
        </p>

        <div>
          <label htmlFor="photos_condition" className={labelClass}>
            Condition photos <span className="text-danger">*</span>
          </label>
          <input
            id="photos_condition"
            name="photos_condition"
            type="file"
            accept="image/*"
            multiple
            required
            className={fileInputClass}
          />
          <p className="text-[11px] text-ink-dim mt-1">
            Close-up photos showing physical condition and any wear.
          </p>
        </div>

        <div>
          <label htmlFor="photos_burn_in" className={labelClass}>
            Burn-in test proof
          </label>
          <input
            id="photos_burn_in"
            name="photos_burn_in"
            type="file"
            accept="image/*"
            multiple
            className={fileInputClass}
          />
          <p className="text-[11px] text-ink-dim mt-1">
            A photo or screenshot from a sustained load test.
          </p>
        </div>

        <div>
          <label htmlFor="photos_benchmark" className={labelClass}>
            Benchmark screenshot
          </label>
          <input
            id="photos_benchmark"
            name="photos_benchmark"
            type="file"
            accept="image/*"
            multiple
            className={fileInputClass}
          />
          <p className="text-[11px] text-ink-dim mt-1">
            Screenshot of the benchmark score above.
          </p>
        </div>

        <div>
          <label htmlFor="photos_boot" className={labelClass}>
            Boot / POST screen
          </label>
          <input
            id="photos_boot"
            name="photos_boot"
            type="file"
            accept="image/*"
            multiple
            className={fileInputClass}
          />
          <p className="text-[11px] text-ink-dim mt-1">
            Proof the part boots and is recognized correctly.
          </p>
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber text-bg-inset text-[14px] font-medium h-11 rounded-(--radius-tag) hover:bg-amber/90 transition-colors disabled:opacity-60"
      >
        {isPending ? "Publishing…" : "Publish listing"}
      </button>
    </form>
  );
}
