import dotenv from 'dotenv';
import { connectMqtt } from './mqtt-client';
import { startHttpListener } from './http-listener';

dotenv.config();

/**
 * GreenLoop IoT Gateway
 *
 * Bridges smart bin hardware (Raspberry Pi, Arduino, etc.) to the backend API.
 * Supports two ingestion modes:
 *
 * 1. MQTT: Subscribes to bin sensor topics and forwards events to the backend
 * 2. HTTP: Listens for webhook POSTs from bins that use HTTP directly
 *
 * Smart bins publish sensor data (fill level, battery, classification results)
 * which this gateway normalises and forwards to the backend webhook endpoint.
 */

const BACKEND_WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL || 'http://localhost:4000/api/smartbins/webhook/bin-event';

async function main() {
  console.log('Starting GreenLoop IoT Gateway...');

  // Start MQTT listener for bins using MQTT protocol
  if (process.env.MQTT_BROKER_URL) {
    connectMqtt({
      brokerUrl: process.env.MQTT_BROKER_URL,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      backendWebhookUrl: BACKEND_WEBHOOK_URL,
    });
  } else {
    console.log('MQTT_BROKER_URL not set, skipping MQTT listener');
  }

  // Start HTTP listener for bins using HTTP webhooks
  const httpPort = parseInt(process.env.HTTP_PORT || '4100', 10);
  startHttpListener(httpPort, BACKEND_WEBHOOK_URL);

  console.log('IoT Gateway running');
}

main().catch(console.error);
