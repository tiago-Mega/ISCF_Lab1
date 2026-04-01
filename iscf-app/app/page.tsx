'use client';

import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { getLatestSensorData, getSensorDataHistory, SensorData, HistoryResponse } from '@/lib/api';

import SensorCard from '@/components/SensorCard';
import DelayControl from '@/components/DelayControl';
import TemperatureChart from '@/components/TemperatureChart';
import AccelerationChart from '@/components/AccelerationChart';
const ReportDownload = dynamic(() => import('@/components/ReportDownload'), { ssr: false });

const HISTORY_LIMIT = 100;

export default function Home() {
  const [history, setHistory] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial data load
  useEffect(() => {
    getSensorDataHistory(HISTORY_LIMIT)
      .then(res => {
        setHistory(res.data);
        if (res.data.length > 0) setLatestData(res.data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Supabase Realtime subscription — replaces polling
  useEffect(() => {
    const channel = supabase
      .channel('accelerometer_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'accelerometer_data' },
        (payload) => {
          const newRow = payload.new as SensorData;
          setLatestData(newRow);
          setHistory(prev => [newRow, ...prev].slice(0, HISTORY_LIMIT));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading sensor data...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">UR5 CPS Monitor</h1>
            <p className="text-sm text-gray-500">
              Real-time CoppeliaSim accelerometer data and weather monitoring
            </p>
          </div>
          {latestData && (
            <span className="text-xs text-gray-400">
              Last updated: {new Date(latestData.timestamp).toLocaleString('pt-PT')}
            </span>
          )}
        </div>

        {/* Live Sensor Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SensorCard title="Accel X" value={latestData?.x ?? null} unit="m/s²" icon="↔️" />
          <SensorCard title="Accel Y" value={latestData?.y ?? null} unit="m/s²" icon="↕️" />
          <SensorCard title="Accel Z" value={latestData?.z ?? null} unit="m/s²" icon="🔄" />
          <SensorCard title="Temperature" value={latestData?.temperature ?? null} unit="°C" icon="🌡️" />
        </div>

        {/* Alarm Control */}
        {/* <AlarmControl latestData={latestData} /> */}

        {/* Charts */}
        {history.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-base font-semibold mb-2 text-gray-700">Accelerometer — X / Y / Z</h2>
              <AccelerationChart data={history} />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-base font-semibold mb-2 text-gray-700">Ambient Temperature</h2>
              <TemperatureChart data={history} />
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">
            No historical data available yet. Data will appear as the probe collects readings.
          </p>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DelayControl />
          <ReportDownload />
        </div>

      </div>
    </main>
  );
}