'use client';

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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

interface Field {
  id: string;
  type: string;
}

interface DataVisualizerProps {
  fields: Field[];
  records: any[];
}

export function DataVisualizer({ fields, records }: DataVisualizerProps) {
  // Filter out internal fields
  const visibleFields = useMemo(() => 
    fields.filter(f => !f.id.startsWith('_')), 
    [fields]
  );

  // Detect numeric fields by checking values
  const numericFields = useMemo(() => {
    return visibleFields.filter(field => {
      // Check multiple records for numeric values
      return records.some((record, idx) => {
        if (idx > 10) return false; // Check only first 10 records
        const value = Number(record[field.id]);
        return !isNaN(value) && value !== null && value !== undefined;
      });
    });
  }, [visibleFields, records]);

  // Initialize with appropriate defaults
  const [xAxis, setXAxis] = useState<string>(() => {
    const nonNumericField = visibleFields.find(f => !numericFields.includes(f));
    return nonNumericField?.id || visibleFields[0]?.id || '';
  });

  const [yAxis, setYAxis] = useState<string>(() => {
    const numericField = numericFields.find(f => f.id !== xAxis);
    return numericField?.id || numericFields[0]?.id || '';
  });

  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

  const chartData = useMemo(() => {
    if (!xAxis || !yAxis) return null;

    const validData = records
      .map(record => ({
        x: record[xAxis],
        y: Number(record[yAxis])
      }))
      .filter(d => d.x != null && !isNaN(d.y))
      .slice(0, 50); // Limit to 50 points for performance

    return {
      labels: validData.map(d => String(d.x)),
      datasets: [
        {
          label: yAxis,
          data: validData.map(d => d.y),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };
  }, [records, xAxis, yAxis]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${yAxis} vs ${xAxis}`,
        padding: {
          top: 10,
          bottom: 30
        },
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          padding: 10,
          autoSkip: true,
          maxTicksLimit: 20
        },
        grid: {
          display: true,
          drawOnChartArea: false
        },
        afterFit: (axis: any) => {
          axis.paddingBottom = 20;
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          padding: 5
        }
      }
    }
  };

  if (visibleFields.length < 2 || records.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay suficientes datos para visualizar
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Eje X (Categorías)
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            >
              {visibleFields.map(field => (
                <option key={field.id} value={field.id}>
                  {field.id}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Eje Y (Valores)
            </label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            >
              {numericFields.map(field => (
                <option key={field.id} value={field.id}>
                  {field.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de gráfico
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'line' | 'bar')}
              className="w-full rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            >
              <option value="bar">Barras</option>
              <option value="line">Líneas</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-[600px] p-4">
        {chartData ? (
          <div className="h-[calc(100%-120px)] w-full pb-16">
            {chartType === 'line' ? (
              <Line options={options} data={chartData} />
            ) : (
              <Bar options={options} data={chartData} />
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No hay datos válidos para visualizar con los campos seleccionados
          </div>
        )}
      </div>
    </div>
  );
} 