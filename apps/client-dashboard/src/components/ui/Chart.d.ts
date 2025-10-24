import React from 'react';
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
declare const Chart: React.FC<ChartProps>;
export default Chart;
