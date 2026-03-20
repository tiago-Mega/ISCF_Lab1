import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SensorData {
  x: number;
  y: number;
  z: number;
  temperature: number;
  timestamp: string;
}

export interface HistoryResponse {
  count: number;
  data: SensorData[];
}

export interface AxisStats {
  min: number | null;
  max: number | null;
  avg: number | null;
}

export interface ReportResponse {
  time_window_minutes: number;
  record_count: number;
  from: string;
  to: string;
  x: AxisStats;
  y: AxisStats;
  z: AxisStats;
  temperature: AxisStats;
}

/**
 * Get the most recent sensor reading
 */
export async function getLatestSensorData(): Promise<SensorData> {
  const response = await axios.get(`${API_URL}/sensor_data.json`);
  return response.data;
}

/**
 * Get sensor data history
 * @param limit Number of records to retrieve (default: 100)
 */
export async function getSensorDataHistory(limit: number = 100): Promise<HistoryResponse> {
  const response = await axios.get(`${API_URL}/sensor_data/history.json`, {
    params: { limit }
  });
  return response.data;
}

/**
 * Get current sampling delay
 */
export async function getCurrentDelay(): Promise<number> {
  const response = await axios.get(`${API_URL}/delay.json`);
  return response.data;
}

/**
 * Update sampling delay
 * @param value New delay in seconds
 */
export async function updateDelay(value: number): Promise<void> {
  await axios.put(`${API_URL}/delay.json`, { delay: value });
}
 
/**
 * Get statistics report for the last N minutes
 * @param minutes Time window in minutes
 */
export async function getSensorDataReport(minutes: number): Promise<ReportResponse> {
  const response = await axios.get(`${API_URL}/sensor_data/report.json`, {
    params: { minutes }
  });
  return response.data;
}