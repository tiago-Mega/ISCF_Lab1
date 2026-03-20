'use client';

import React, { useState } from 'react';
import { getSensorDataReport, ReportResponse } from '@/lib/api';

const TIME_OPTIONS = [10, 30, 60];

function statsToCSV(report: ReportResponse): string {
  const headers = ['Axis', 'Min', 'Max', 'Average'];
  const rows = [
    ['X (m/s²)', report.x.min, report.x.max, report.x.avg],
    ['Y (m/s²)', report.y.min, report.y.max, report.y.avg],
    ['Z (m/s²)', report.z.min, report.z.max, report.z.avg],
    ['Temperature (°C)', report.temperature.min, report.temperature.max, report.temperature.avg],
  ];

  const meta = [
    `Report generated:,${new Date().toLocaleString()}`,
    `Time window:,Last ${report.time_window_minutes} minutes`,
    `Records analysed:,${report.record_count}`,
    `From:,${new Date(report.from).toLocaleString()}`,
    `To:,${new Date(report.to).toLocaleString()}`,
    '',
  ];

  return [
    ...meta,
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');
}

export default function ReportDownload() {
  const [minutes, setMinutes] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const report = await getSensorDataReport(minutes);
      const csv = statsToCSV(report);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `UR5_Report_last_${minutes}min_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to generate report. No data in this time window?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">📊 Download Statistics Report</h2>
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700">Time Window:</label>
        {TIME_OPTIONS.map(opt => (
          <button
            key={opt}
            onClick={() => setMinutes(opt)}
            className={`px-3 py-1 rounded text-sm border ${
              minutes === opt
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last {opt} min
          </button>
        ))}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : '⬇ Download CSV'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
