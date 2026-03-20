import React from 'react';

interface SensorCardProps {
  title: string;
  value: number | null;
  unit: string;
  icon?: string;
}

export default function SensorCard({ title, value, unit, icon }: SensorCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value !== null ? value.toFixed(2) : '---'}
        <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">{unit}</span>
      </p>
    </div>
  );
}
