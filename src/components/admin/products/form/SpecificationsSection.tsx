"use client";

import { useLanguage } from "@/context/LanguageContext";

const bladeSteels = [
  "CPM MagnaCut",
  "CPM S45VN",
  "CPM S35VN",
  "CPM CruWear",
  "CPM 20CV",
  "CPM M4",
  "CPM 3V",
  "M390",
  "Elmax",
  "Böhler N690",
  "154CM",
  "D2",
  "VG-10",
  "AUS-10",
  "14C28N",
  "Sandvik 12C27",
  "8Cr13MoV",
];

const lockingTypes = [
  "Liner Lock",
  "Frame Lock",
  "Axis Lock",
  "Crossbar Lock",
  "Compression Lock",
  "Back Lock",
  "Button Lock",
  "Tri-Ad Lock",
  "Slip Joint",
];

type Product = {
  overall_length: string | null;
  blade_length: string | null;
  blade_thickness: string | null;
  blade_steel: string | null;
  handle_material: string | null;
  locking_type: string | null;
  knife_type: string | null;
  weight: string | null;
};

type SpecificationsSectionProps = {
  product?: Product;
};

export default function SpecificationsSection({
  product,
}: SpecificationsSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 md:p-6">
      <h2 className="mb-6 text-xl font-bold text-white">{t.specifications}</h2>

      <div className="grid gap-5 md:grid-cols-2">
        {/* OVERALL LENGTH */}
        <div>
          <label
            htmlFor="overallLength"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.overallLength}
          </label>

          <input
            id="overallLength"
            type="text"
            name="overallLength"
            defaultValue={product?.overall_length ?? ""}
            placeholder="21.8 cm"
            title={t.overallLength}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* BLADE LENGTH */}
        <div>
          <label
            htmlFor="bladeLength"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.bladeLength}
          </label>

          <input
            id="bladeLength"
            type="text"
            name="bladeLength"
            defaultValue={product?.blade_length ?? ""}
            placeholder="9.4 cm"
            title={t.bladeLength}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* BLADE THICKNESS */}
        <div>
          <label
            htmlFor="bladeThickness"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.bladeThickness}
          </label>

          <input
            id="bladeThickness"
            type="text"
            name="bladeThickness"
            defaultValue={product?.blade_thickness ?? ""}
            placeholder="3.7 mm"
            title={t.bladeThickness}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* BLADE STEEL */}
        <div>
          <label
            htmlFor="bladeSteel"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.bladeSteel}
          </label>

          <select
            id="bladeSteel"
            name="bladeSteel"
            defaultValue={product?.blade_steel ?? ""}
            title={t.bladeSteel}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          >
            <option value="">{t.selectSteel}</option>

            {bladeSteels.map((steel) => (
              <option key={steel} value={steel}>
                {steel}
              </option>
            ))}
          </select>
        </div>

        {/* HANDLE MATERIAL */}
        <div>
          <label
            htmlFor="handleMaterial"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.handleMaterial}
          </label>

          <input
            id="handleMaterial"
            type="text"
            name="handleMaterial"
            defaultValue={product?.handle_material ?? ""}
            placeholder="G10"
            title={t.handleMaterial}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* LOCKING TYPE */}
        <div>
          <label
            htmlFor="lockingType"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.lockingType}
          </label>

          <select
            id="lockingType"
            name="lockingType"
            defaultValue={product?.locking_type ?? ""}
            title={t.lockingType}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          >
            <option value="">{t.selectLocking}</option>

            {lockingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* KNIFE TYPE */}
        <div>
          <label
            htmlFor="knifeType"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.knifeType}
          </label>

          <input
            id="knifeType"
            type="text"
            name="knifeType"
            defaultValue={product?.knife_type ?? ""}
            placeholder="Folding Knife"
            title={t.knifeType}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {/* WEIGHT */}
        <div>
          <label
            htmlFor="weight"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            {t.weight}
          </label>

          <input
            id="weight"
            type="text"
            name="weight"
            defaultValue={product?.weight ?? ""}
            placeholder="110 g"
            title={t.weight}
            className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>
      </div>
    </div>
  );
}
