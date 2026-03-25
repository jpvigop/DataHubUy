'use client';

import { useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

import type { DatastoreField, DatastoreRecord } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizerProps {
  fields: DatastoreField[];
  records: DatastoreRecord[];
}

export function DataVisualizer({ fields, records }: DataVisualizerProps) {
  const visibleFields = useMemo(
    () => fields.filter((field) => !field.id.startsWith('_')),
    [fields]
  );

  const numericFields = useMemo(
    () =>
      visibleFields.filter((field) =>
        records.slice(0, 10).some((record) => {
          const value = record[field.id];
          return value !== null && value !== undefined && !Number.isNaN(Number(value));
        })
      ),
    [records, visibleFields]
  );

  const [xAxis, setXAxis] = useState(() => visibleFields[0]?.id ?? '');
  const [yAxis, setYAxis] = useState(() => numericFields[0]?.id ?? '');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const chartData = useMemo(() => {
    if (!xAxis || !yAxis) {
      return null;
    }

    const data = records
      .map((record) => ({
        x: record[xAxis],
        y: Number(record[yAxis]),
      }))
      .filter((item) => item.x !== null && item.x !== undefined && !Number.isNaN(item.y))
      .slice(0, 50);

    return {
      labels: data.map((item) => String(item.x)),
      datasets: [
        {
          backgroundColor: 'rgba(14, 165, 233, 0.35)',
          borderColor: 'rgb(14, 165, 233)',
          data: data.map((item) => item.y),
          label: yAxis,
        },
      ],
    };
  }, [records, xAxis, yAxis]);

  if (visibleFields.length < 2 || numericFields.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No hay suficientes columnas compatibles para generar un grafico.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Eje X</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => setXAxis(event.target.value)}
            value={xAxis}
          >
            {visibleFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.id}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Eje Y</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => setYAxis(event.target.value)}
            value={yAxis}
          >
            {numericFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.id}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Tipo de grafico</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => setChartType(event.target.value as 'bar' | 'line')}
            value={chartType}
          >
            <option value="bar">Barras</option>
            <option value="line">Lineas</option>
          </select>
        </label>
      </div>

      <div className="min-h-[420px] rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        {chartData ? (
          chartType === 'line' ? (
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
              }}
            />
          ) : (
            <Bar
              data={chartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
              }}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            No hay datos validos para el grafico actual.
          </div>
        )}
      </div>
    </div>
  );
}
