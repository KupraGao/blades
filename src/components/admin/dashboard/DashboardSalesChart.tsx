"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { DashboardDailySales } from "@/actions/admin/get-admin-dashboard-data";

type Props = {
  series: DashboardDailySales[];
};

function formatShortDay(dateKey: string): string {
  const parts = dateKey.split("-");
  if (parts.length !== 3) return dateKey;
  return `${parts[2]}.${parts[1]}`;
}

function formatAxisGel(value: number): string {
  if (Math.abs(value - Math.round(value)) < 1e-9) {
    return `₾${Math.round(value)}`;
  }
  return `₾${value}`;
}

function formatTotalGel(value: number): string {
  if (Math.abs(value - Math.round(value)) < 1e-9) {
    return `₾${Math.round(value)}`;
  }
  return `₾${value}`;
}

/** Nice Y-axis scale from max daily total; always includes 0. */
function getAxisScale(maxValue: number): { scaleMax: number; ticks: number[] } {
  if (maxValue <= 0) {
    return { scaleMax: 0, ticks: [0] };
  }

  const targetDivisions = 4;
  const roughStep = maxValue / targetDivisions;
  const exp = Math.floor(Math.log10(roughStep));
  const magnitude = Math.pow(10, exp);
  const residual = roughStep / magnitude;

  let niceStep: number;
  if (residual <= 1) niceStep = 1 * magnitude;
  else if (residual <= 2) niceStep = 2 * magnitude;
  else if (residual <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const scaleMax = Math.ceil(maxValue / niceStep) * niceStep;
  const ticks: number[] = [];
  for (let value = 0; value <= scaleMax + niceStep * 1e-9; value += niceStep) {
    ticks.push(Number(value.toPrecision(12)));
  }

  return { scaleMax, ticks };
}

/** Evenly spaced X-axis label indexes, always including first and last. */
function getLabelIndexes(length: number, labelCount: number): number[] {
  if (length <= 0) return [];
  if (length === 1) return [0];

  const count = Math.min(Math.max(labelCount, 2), length);
  const indexes = new Set<number>();
  for (let i = 0; i < count; i++) {
    indexes.add(Math.round((i * (length - 1)) / (count - 1)));
  }
  return [...indexes].sort((a, b) => a - b);
}

export default function DashboardSalesChart({ series }: Props) {
  const { t } = useLanguage();

  const periodTotal = series.reduce((sum, point) => sum + point.total, 0);
  const maxTotal = series.reduce(
    (max, point) => (point.total > max ? point.total : max),
    0,
  );
  const hasSales = maxTotal > 0;
  const { scaleMax, ticks } = getAxisScale(maxTotal);

  const chartHeight = 200;
  const chartWidth = 720;
  const paddingLeft = 40;
  const paddingRight = 4;
  const paddingTop = 8;
  const paddingBottom = 22;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const barCount = Math.max(series.length, 1);
  const slotWidth = plotWidth / barCount;
  const barWidth = Math.max(slotWidth * 0.55, 1.2);

  const desktopLabelIndexes = new Set(getLabelIndexes(series.length, 6));
  const mobileLabelIndexes = new Set(getLabelIndexes(series.length, 4));

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-white">
            {t.dashboardSalesLast30Days}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            {t.dashboardSalesCompletedOnly}
          </p>
        </div>
        <p className="shrink-0 pt-0.5 text-base font-semibold tabular-nums text-zinc-100 sm:text-lg">
          {formatTotalGel(periodTotal)}
        </p>
      </div>

      {!hasSales ? (
        <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 px-4 text-center text-sm text-zinc-400 sm:h-[200px]">
          {t.dashboardNoSalesInPeriod}
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-[200px] w-full sm:h-[240px]"
            role="img"
            aria-label={t.dashboardSalesLast30Days}
          >
            {ticks.map((tick) => {
              const y =
                scaleMax > 0
                  ? paddingTop + plotHeight * (1 - tick / scaleMax)
                  : paddingTop + plotHeight;

              return (
                <g key={`tick-${tick}`}>
                  <line
                    x1={paddingLeft}
                    x2={chartWidth - paddingRight}
                    y1={y}
                    y2={y}
                    className="stroke-zinc-800"
                    strokeWidth={1}
                    opacity={0.65}
                  />
                  <text
                    x={paddingLeft - 5}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-zinc-500 text-[8px]"
                  >
                    {formatAxisGel(tick)}
                  </text>
                </g>
              );
            })}

            {series.map((point, index) => {
              const ratio = scaleMax > 0 ? point.total / scaleMax : 0;
              const barH =
                point.total > 0 ? Math.max(ratio * plotHeight, 2) : 0;
              const x =
                paddingLeft + index * slotWidth + (slotWidth - barWidth) / 2;
              const y = paddingTop + (plotHeight - barH);
              const showDesktopLabel = desktopLabelIndexes.has(index);
              const showMobileLabel = mobileLabelIndexes.has(index);

              return (
                <g key={point.dateKey}>
                  {barH > 0 ? (
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      rx={1.5}
                      className="fill-brand-orange/90"
                    >
                      <title>
                        {`${formatShortDay(point.dateKey)} — ₾${point.total}`}
                      </title>
                    </rect>
                  ) : null}

                  {showMobileLabel ? (
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className="fill-zinc-500 text-[8px] sm:hidden"
                    >
                      {formatShortDay(point.dateKey)}
                    </text>
                  ) : null}

                  {showDesktopLabel ? (
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className="hidden fill-zinc-500 text-[8px] sm:block"
                    >
                      {formatShortDay(point.dateKey)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}
