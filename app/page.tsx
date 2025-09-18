'use client';

import { useEffect, useState } from 'react';

interface PhoneData {
  number: string;
  valid: boolean;
  local_format: string;
  international_format: string;
  country_prefix: string;
  country_code: string;
  country_name: string;
  location: string;
  carrier: string;
  line_type: string;
  cached?: boolean;
}

const lineTypeColors: Record<string, string> = {
  mobile: 'bg-green-500',
  landline: 'bg-blue-500',
  toll_free: 'bg-yellow-500',
  premium_rate: 'bg-red-500',
  special_services: 'bg-purple-500',
  satellite: 'bg-pink-500',
  paging: 'bg-indigo-500',
};

export default function PhoneValidationPage() {
  const [number, setNumber] = useState('');
  const [pin, setPin] = useState('');
  const [data, setData] = useState<PhoneData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PhoneData[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<PhoneData[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string[]>([]);

  // Fetch history from your DB
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/validate/history');
      if (!res.ok) return;
      const result: PhoneData[] = await res.json();
      setHistory(result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Include typed numbers in filteredHistory
  useEffect(() => {
    const filtered = history.filter((h) => h.number.includes(number));

    if (number && !history.some((h) => h.number === number)) {
      filtered.unshift({
        number,
        valid: false,
        local_format: '',
        international_format: '',
        country_prefix: '',
        country_code: '',
        country_name: '',
        location: '',
        carrier: '',
        line_type: '',
        cached: false,
      });
    }

    setFilteredHistory(filtered);
  }, [number, history]);

  const formatLocal = (num: string | null) => {
    if (!num) return '';
    return num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  const formatInternational = (num: string | null) => {
    if (!num) return '';
    return num.replace(/(\+\d)(\d{3})(\d{3})(\d{4})/, '$1 $2-$3-$4');
  };

  const fetchPhoneData = async () => {
    if (!number) return;
    if (pin !== '053053') {
      setError('Invalid PIN');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number }),
      });
      const result = await res.json();
      if (res.ok) {
        setData(result);
        fetchHistory();
      } else setError(result.error || 'Something went wrong');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleHistory = (num: string) => {
    setExpandedHistory((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const handleSelect = (num: string) => {
    const found = history.find((h) => h.number === num);
    if (found) setData(found);
    setNumber(num);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 flex flex-col items-center justify-between">
      {/* Gradient Title */}
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
        📞 Number Verify
      </h1>

      {/* Input + PIN + Lookup */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-md">
        <input
          type="text"
          placeholder="17194445555"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        />
        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-32 px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        />
        <button
          onClick={fetchPhoneData}
          disabled={pin !== '053053'}
          className={`px-6 py-2 font-semibold rounded-lg shadow-lg transition transform ${
            pin === '053053'
              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:scale-105'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Lookup
        </button>
      </div>

      {/* Searchable collapsible history */}
      {filteredHistory.length > 0 && (
        <div className="w-full max-w-md mb-6 backdrop-blur-md bg-gray-800/50 rounded-xl p-2 shadow-lg">
          <p className="mb-2 font-medium text-pink-400">Previous Lookups</p>
          <div className="flex flex-col gap-2">
            {filteredHistory.map((h) => (
              <div key={h.number} className="bg-gray-900/50 rounded-lg shadow-sm overflow-hidden">
                <button
                  className="w-full flex justify-between px-4 py-2 items-center hover:bg-gray-700 transition"
                  onClick={() => toggleHistory(h.number)}
                >
                  <span className="font-bold">{h.number}</span>
                  {h.cached && <span className="text-green-400 text-sm">(cached)</span>}
                  <span>{expandedHistory.includes(h.number) ? '▲' : '▼'}</span>
                </button>
                {expandedHistory.includes(h.number) && (
                  <div className="p-4 bg-gray-800 border-t border-gray-700">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {h.carrier && (
                        <span className="px-2 py-1 bg-purple-600 rounded-full text-sm font-medium">
                          {h.carrier}
                        </span>
                      )}
                      {h.line_type && (
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            lineTypeColors[h.line_type] || 'bg-gray-500'
                          }`}
                        >
                          {h.line_type.replace('_', ' ')}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-pink-600 rounded-full text-sm font-medium">
                        {h.valid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>
                    <table className="w-full table-auto border-collapse border border-gray-700 rounded-lg">
                      <tbody>
                        {Object.entries(h).map(([key, value]) => {
                          if (['cached', 'carrier', 'line_type'].includes(key)) return null;
                          return (
                            <tr key={key} className="border-b border-gray-700 hover:bg-gray-700 transition">
                              <td className="px-4 py-1 font-medium capitalize">{key.replace(/_/g, ' ')}</td>
                              <td className="px-4 py-1">{value}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-gray-400 mb-4 animate-pulse">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Validation Result Card */}
      {data && (
        <div className="w-full max-w-3xl bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl overflow-auto mb-8 transition transform hover:scale-101">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold text-pink-400">
              Validation Result {data.cached && '(cached)'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.carrier && (
                <span className="px-2 py-1 bg-purple-600 rounded-full text-sm font-medium">
                  {data.carrier}
                </span>
              )}
              {data.line_type && (
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                    lineTypeColors[data.line_type] || 'bg-gray-500'
                  }`}
                >
                  {data.line_type.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
          <table className="w-full table-auto border-collapse border border-gray-700 overflow-x-auto rounded-lg">
            <tbody>
              {Object.entries(data).map(([key, value]) => {
                let displayValue = value;

                if (key === 'valid') {
                  displayValue = (
                    <span
                      className={`px-2 py-1 rounded ${
                        value ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {value ? 'Valid' : 'Invalid'}
                    </span>
                  );
                }

                if (key === 'local_format') displayValue = formatLocal(value);
                if (key === 'international_format') displayValue = formatInternational(value);

                return (
                  <tr key={key} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="px-4 py-2 font-medium capitalize">{key.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2">{displayValue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <img
          src="https://img.shields.io/badge/powered%20by-JesseJesse.com-blue"
          alt="Powered by JesseJesse.com"
          className="mx-auto"
        />
      </footer>
    </div>
  );
}






