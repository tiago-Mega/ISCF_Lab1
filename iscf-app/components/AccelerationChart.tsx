'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorData } from '@/lib/api';

interface AccelerationChartProps {
  data: SensorData[];
}

export default function AccelerationChart({ data }: AccelerationChartProps) {
  // Prepare data for chart (reverse to show oldest to newest)
  const chartData = [...data].reverse().map((point, index) => ({
    index,
    time: new Date(point.timestamp).toLocaleTimeString(),
    x: point.x,
    y: point.y,
    z: point.z,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Acceleration Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            label={{ value: 'm/s²', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="x" stroke="#ef4444" name="X-axis" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="y" stroke="#3b82f6" name="Y-axis" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="z" stroke="#10b981" name="Z-axis" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
