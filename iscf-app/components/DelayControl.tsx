'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentDelay, updateDelay } from '@/lib/api';

export default function DelayControl() {
  const [delay, setDelay] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Fetch current delay on mount
    getCurrentDelay().then(setDelay).catch(console.error);
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');
    try {
      await updateDelay(delay);
      setMessage('Delay updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update delay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Sampling Delay Control
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Delay (seconds): {delay}
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1s</span>
            <span>30s</span>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Updating...' : 'Apply Delay'}
        </button>

        {message && (
          <p className={`text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
