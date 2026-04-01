'use client';
import React, { useState } from 'react';
import { getSensorDataReport, ReportResponse } from '@/lib/api';
import jsPDF from 'jspdf';

const TIME_OPTIONS = [10, 30, 60];

function generatePDF(report: ReportResponse, minutes: number): void {
  const doc = new jsPDF();
  const now = new Date().toLocaleString('pt-PT');

  // Title
  doc.setFontSize(18);
  doc.text('UR5 Accelerometer Report', 20, 20);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${now}`, 20, 30);
  doc.text(`Time window: Last ${minutes} minutes`, 20, 36);
  doc.text(`From: ${new Date(report.from).toLocaleString('pt-PT')}`, 20, 42);
  doc.text(`To:   ${new Date(report.to).toLocaleString('pt-PT')}`, 20, 48);
  doc.text(`Records analysed: ${report.record_count}`, 20, 54);

  // Table header
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Axis', 20, 70);
  doc.text('Min', 70, 70);
  doc.text('Max', 110, 70);
  doc.text('Average', 150, 70);
  doc.line(20, 72, 190, 72);

  // Table rows
  const rows = [
    ['X (m/s²)',        report.x.min,           report.x.max,           report.x.avg],
    ['Y (m/s²)',        report.y.min,           report.y.max,           report.y.avg],
    ['Z (m/s²)',        report.z.min,           report.z.max,           report.z.avg],
    ['Temperature (°C)', report.temperature.min, report.temperature.max, report.temperature.avg],
  ];

  doc.setFontSize(11);
  rows.forEach((row, i) => {
    const y = 82 + i * 10;
    doc.text(String(row[0]), 20, y);
    doc.text(Number(row[1]).toFixed(3), 70, y);
    doc.text(Number(row[2]).toFixed(3), 110, y);
    doc.text(Number(row[3]).toFixed(3), 150, y);
  });

  doc.save(`UR5_Report_last_${minutes}min_${Date.now()}.pdf`);
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
      generatePDF(report, minutes);
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
          {loading ? 'Generating...' : '⬇ Download PDF'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
