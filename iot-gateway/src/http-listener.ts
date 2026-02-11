import http from 'http';
import axios from 'axios';

/**
 * Simple HTTP listener for smart bins that POST data directly via HTTP.
 * Receives bin events and forwards them to the backend webhook.
 *
 * Expected POST body (JSON):
 * {
 *   "deviceId": "bin-001",
 *   "apiKey": "device-api-key",
 *   "eventType": "fill_update",
 *   "payload": { "fillLevel": 75 }
 * }
 */
export function startHttpListener(port: number, backendWebhookUrl: string) {
  const server = http.createServer(async (req, res) => {
    // Health check
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'iot-gateway' }));
      return;
    }

    // Only accept POSTs to /ingest
    if (req.method !== 'POST' || req.url !== '/ingest') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        console.log(`[HTTP] ${data.deviceId} -> ${data.eventType}`);

        // Forward to backend
        await axios.post(backendWebhookUrl, data);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (error) {
        console.error('[HTTP] Error processing request:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Processing failed' }));
      }
    });
  });

  server.listen(port, () => {
    console.log(`IoT HTTP listener running on port ${port}`);
  });

  return server;
}
