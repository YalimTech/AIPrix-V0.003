import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
const Chart = ({ type, data, options = {}, className = '' }) => {
    const canvasRef = useRef(null);
    const chartInstanceRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current)
            return;
        // Dynamic import of Chart.js
        const initChart = async () => {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);
            // Destroy existing chart
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            // Create new chart
            chartInstanceRef.current = new Chart(canvasRef.current, {
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
    return (_jsx("div", { className: `relative ${className}`, children: _jsx("canvas", { ref: canvasRef }) }));
};
export default Chart;
