import mqtt from 'mqtt';
import axios from 'axios';

interface MqttConfig {
  brokerUrl: string;
  username?: string;
  password?: string;
  backendWebhookUrl: string;
}

/**
 * Connects to the MQTT broker and subscribes to smart bin topics.
 *
 * Expected topic structure:
 *   greenloop/bins/{deviceId}/fill    -> fill level updates
 *   greenloop/bins/{deviceId}/battery -> battery level
 *   greenloop/bins/{deviceId}/classify -> classification results
 *   greenloop/bins/{deviceId}/error   -> device errors
 */
export function connectMqtt(config: MqttConfig) {
  const client = mqtt.connect(config.brokerUrl, {
    username: config.username,
    password: config.password,
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log(`Connected to MQTT broker: ${config.brokerUrl}`);
    client.subscribe('greenloop/bins/+/+', (err) => {
      if (err) console.error('MQTT subscribe error:', err);
      else console.log('Subscribed to greenloop/bins/+/+');
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const parts = topic.split('/');
      const deviceId = parts[2];
      const eventType = mapTopicToEventType(parts[3]);
      const payload = JSON.parse(message.toString());

      console.log(`[MQTT] ${deviceId} -> ${eventType}:`, payload);

      // Forward to backend webhook
      await axios.post(config.backendWebhookUrl, {
        deviceId,
        apiKey: payload.apiKey,
        eventType,
        payload,
      });
    } catch (error) {
      console.error('[MQTT] Error processing message:', error);
    }
  });

  client.on('error', (err) => {
    console.error('MQTT connection error:', err);
  });

  return client;
}

function mapTopicToEventType(suffix: string): string {
  const mapping: Record<string, string> = {
    fill: 'fill_update',
    battery: 'battery_update',
    classify: 'classification',
    error: 'error',
  };
  return mapping[suffix] || 'unknown';
}
