import React, { useEffect, useRef } from 'react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  data: ChartData;
  options?: any;
  className?: string;
}

const Chart: React.FC<ChartProps> = ({ type, data, options = {}, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamic import of Chart.js
    const initChart = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      // Destroy existing chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create new chart
      chartInstanceRef.current = new Chart(canvasRef.current!, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
            tooltip: {
              enabled: true,
            },
          },
          scales: type === 'line' || type === 'bar' ? {
            y: {
              beginAtZero: true,
            },
          } : undefined,
          ...options,
        },
      });
    };

    initChart();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Chart;
