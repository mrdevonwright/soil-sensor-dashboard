import Link from "next/link";

export const metadata = {
  title: "API Documentation - Soil Sensor Dashboard",
  description: "REST API documentation for accessing soil sensor data",
};

export default function ApiDocsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiBase = `${baseUrl}/rest/v1`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Soil Sensor Dashboard
            </h1>
            <nav className="flex gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Devices
              </Link>
              <Link
                href="/firmware"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Firmware
              </Link>
              <Link
                href="/config"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Config
              </Link>
              <Link
                href="/api-docs"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                API
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Soil Sensor REST API
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Access soil sensor data programmatically. Build custom dashboards,
            integrate with other systems, or analyze historical data.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
            <span className="text-gray-500">Base URL:</span>{" "}
            <span className="text-blue-600">{apiBase}</span>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h3 className="text-xl font-semibold text-gray-900">
              Authentication
            </h3>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              All API requests require an API key passed in the request headers.
              Contact the administrator to obtain your API key.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
              <pre>{`# Required headers for all requests
apikey: YOUR_API_KEY
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}</pre>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-8">
          {/* Sensor Readings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  GET
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Get Sensor Readings
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm mb-4">
                {apiBase}/sensor_readings
              </div>

              <p className="text-gray-600 mb-4">
                Retrieve soil sensor readings. Each reading contains moisture,
                temperature, and salinity data at 12 depth levels.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">
                Query Parameters
              </h4>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-gray-900">
                        Parameter
                      </th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-900">
                        Type
                      </th>
                      <th className="text-left py-2 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono text-blue-600">
                        select
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2">
                        Columns to return (default: all). Example:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          select=device_id,timestamp,moisture_levels
                        </code>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono text-blue-600">
                        device_id
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2">
                        Filter by device MAC address. Example:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          device_id=eq.C4:DD:57:CB:6A:74
                        </code>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono text-blue-600">
                        timestamp
                      </td>
                      <td className="py-2 pr-4">integer</td>
                      <td className="py-2">
                        Filter by Unix timestamp. Example:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          timestamp=gte.1700000000
                        </code>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono text-blue-600">
                        order
                      </td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2">
                        Sort results. Example:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          order=timestamp.desc
                        </code>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono text-blue-600">
                        limit
                      </td>
                      <td className="py-2 pr-4">integer</td>
                      <td className="py-2">
                        Max number of results. Example:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          limit=100
                        </code>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-blue-600">
                        offset
                      </td>
                      <td className="py-2 pr-4">integer</td>
                      <td className="py-2">
                        Skip N results (pagination). Example:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          offset=100
                        </code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">
                Example Request
              </h4>
              <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto mb-4">
                <pre>{`curl "${apiBase}/sensor_readings?order=timestamp.desc&limit=10" \\
  -H "apikey: YOUR_API_KEY" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">
                Example Response
              </h4>
              <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                <pre>{`[
  {
    "id": "uuid-here",
    "device_id": "C4:DD:57:CB:6A:74",
    "timestamp": 1708300800,
    "farm_id": "farm-uuid",
    "block_id": "block-uuid",
    "soil_moisture": 32.5,
    "soil_temperature": 18.2,
    "electrical_conductivity": 1.23,
    "num_levels": 12,
    "moisture_levels": [28.1, 29.3, 30.5, 31.2, 32.8, 33.4, 34.1, 35.0, 35.8, 36.2, 36.9, 37.5],
    "temperature_levels": [22.1, 21.8, 21.2, 20.5, 19.8, 19.2, 18.7, 18.3, 17.9, 17.5, 17.1, 16.8],
    "salinity_levels": [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.5, 1.6, 1.6, 1.7],
    "firmware_version": "1.0.0",
    "wifi_rssi": -65,
    "created_at": "2024-02-19T00:00:00Z"
  }
]`}</pre>
              </div>
            </div>
          </div>

          {/* Devices */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  GET
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Get Devices
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm mb-4">
                {apiBase}/devices
              </div>

              <p className="text-gray-600 mb-4">
                Retrieve registered sensor devices with their status and
                metadata.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">
                Example Request
              </h4>
              <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto mb-4">
                <pre>{`curl "${apiBase}/devices?order=last_seen_at.desc" \\
  -H "apikey: YOUR_API_KEY" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">
                Response Fields
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-gray-900">
                        Field
                      </th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-900">
                        Type
                      </th>
                      <th className="text-left py-2 font-medium text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono">device_id</td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2">MAC address (unique identifier)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono">device_name</td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2">Human-readable device name</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono">status</td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2">
                        online, offline, updating, error, unknown
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono">last_seen_at</td>
                      <td className="py-2 pr-4">timestamp</td>
                      <td className="py-2">Last communication time</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono">firmware_version</td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2">Current firmware version</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono">wifi_rssi</td>
                      <td className="py-2 pr-4">integer</td>
                      <td className="py-2">WiFi signal strength (dBm)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono">farm_id, block_id</td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2">Location identifiers</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Code Examples
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {/* JavaScript */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  JavaScript / Node.js
                </h4>
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                  <pre>{`const API_KEY = 'YOUR_API_KEY';
const BASE_URL = '${apiBase}';

async function getLatestReadings(deviceId, limit = 10) {
  const url = new URL(\`\${BASE_URL}/sensor_readings\`);
  url.searchParams.set('device_id', \`eq.\${deviceId}\`);
  url.searchParams.set('order', 'timestamp.desc');
  url.searchParams.set('limit', limit);

  const response = await fetch(url, {
    headers: {
      'apikey': API_KEY,
      'Authorization': \`Bearer \${API_KEY}\`
    }
  });

  return response.json();
}

// Get last 24 hours of readings
async function getLast24Hours(deviceId) {
  const since = Math.floor(Date.now() / 1000) - 86400;
  const url = new URL(\`\${BASE_URL}/sensor_readings\`);
  url.searchParams.set('device_id', \`eq.\${deviceId}\`);
  url.searchParams.set('timestamp', \`gte.\${since}\`);
  url.searchParams.set('order', 'timestamp.asc');

  const response = await fetch(url, {
    headers: {
      'apikey': API_KEY,
      'Authorization': \`Bearer \${API_KEY}\`
    }
  });

  return response.json();
}`}</pre>
                </div>
              </div>

              {/* Python */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Python</h4>
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                  <pre>{`import requests
from datetime import datetime, timedelta

API_KEY = 'YOUR_API_KEY'
BASE_URL = '${apiBase}'

headers = {
    'apikey': API_KEY,
    'Authorization': f'Bearer {API_KEY}'
}

def get_latest_readings(device_id, limit=10):
    response = requests.get(
        f'{BASE_URL}/sensor_readings',
        headers=headers,
        params={
            'device_id': f'eq.{device_id}',
            'order': 'timestamp.desc',
            'limit': limit
        }
    )
    return response.json()

def get_readings_since(device_id, hours=24):
    since = int((datetime.now() - timedelta(hours=hours)).timestamp())
    response = requests.get(
        f'{BASE_URL}/sensor_readings',
        headers=headers,
        params={
            'device_id': f'eq.{device_id}',
            'timestamp': f'gte.{since}',
            'order': 'timestamp.asc'
        }
    )
    return response.json()

# Example: Get average moisture by depth level
readings = get_latest_readings('C4:DD:57:CB:6A:74', limit=100)
if readings:
    avg_moisture = [sum(r['moisture_levels'][i] for r in readings) / len(readings)
                    for i in range(12)]
    print(f'Average moisture by depth: {avg_moisture}')`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Data Schema */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Sensor Data Schema
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Each sensor reading contains data from 12 depth levels. Arrays
                are ordered from shallowest to deepest.
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-gray-900">
                        Level
                      </th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-900">
                        Depth
                      </th>
                      <th className="text-left py-2 font-medium text-gray-900">
                        Array Index
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {[
                      "0-10 cm",
                      "10-20 cm",
                      "20-30 cm",
                      "30-40 cm",
                      "40-50 cm",
                      "50-60 cm",
                      "60-70 cm",
                      "70-80 cm",
                      "80-90 cm",
                      "90-100 cm",
                      "100-110 cm",
                      "110-120 cm",
                    ].map((depth, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2 pr-4">{i + 1}</td>
                        <td className="py-2 pr-4">{depth}</td>
                        <td className="py-2 font-mono">[{i}]</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">
                    Moisture (%)
                  </h5>
                  <p className="text-sm text-blue-700">
                    Volumetric water content. Typical range: 5-50%
                  </p>
                  <p className="text-xs text-blue-600 mt-1 font-mono">
                    moisture_levels[]
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-900 mb-2">
                    Temperature (°C)
                  </h5>
                  <p className="text-sm text-orange-700">
                    Soil temperature. Decreases with depth.
                  </p>
                  <p className="text-xs text-orange-600 mt-1 font-mono">
                    temperature_levels[]
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-2">
                    Salinity (dS/m)
                  </h5>
                  <p className="text-sm text-green-700">
                    Electrical conductivity. Indicates soil salinity.
                  </p>
                  <p className="text-xs text-green-600 mt-1 font-mono">
                    salinity_levels[]
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Rate Limits & Best Practices
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    Use <code className="bg-gray-100 px-1 rounded">limit</code>{" "}
                    and{" "}
                    <code className="bg-gray-100 px-1 rounded">offset</code> for
                    pagination when fetching large datasets
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    Use{" "}
                    <code className="bg-gray-100 px-1 rounded">select</code> to
                    request only the columns you need
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    Filter by{" "}
                    <code className="bg-gray-100 px-1 rounded">timestamp</code>{" "}
                    to limit data range instead of fetching all records
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Cache responses where appropriate for historical data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">⚠</span>
                  <span>
                    API is rate-limited. Contact admin if you need higher
                    limits.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            Need an API key or have questions?{" "}
            <a
              href="mailto:admin@example.com"
              className="text-blue-600 hover:underline"
            >
              Contact the administrator
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
