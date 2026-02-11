import { Router, Request, Response, NextFunction } from 'express';
import { SmartBinService } from './smartbin.service';

const router = Router();
const smartBinService = new SmartBinService();

/**
 * Webhook endpoint for smart bin sensor data.
 * This is called by the IoT gateway or directly by smart bin hardware.
 *
 * Expected payload:
 * {
 *   "deviceId": "bin-001",
 *   "apiKey": "device-api-key",
 *   "eventType": "fill_update" | "collection" | "error" | "classification",
 *   "payload": { ... sensor-specific data ... }
 * }
 */
router.post('/webhook/bin-event', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId, apiKey, eventType, payload } = req.body;

    // Validate device API key
    const bin = await smartBinService.findByDeviceId(deviceId);
    if (!bin) {
      return res.status(404).json({ error: 'Unknown device' });
    }
    if (bin.apiKey !== apiKey) {
      return res.status(401).json({ error: 'Invalid device API key' });
    }

    // Record the event
    await smartBinService.recordEvent(bin.id, eventType, payload);

    // Update fill level if this is a fill_update event
    if (eventType === 'fill_update' && typeof payload.fillLevel === 'number') {
      await smartBinService.updateFillLevel(deviceId, payload.fillLevel);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export default router;
