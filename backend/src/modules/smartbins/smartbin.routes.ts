import { Router, Request, Response, NextFunction } from 'express';
import { SmartBinService } from './smartbin.service';
import { roleGuard } from '../../middleware/role-guard';

const router = Router();
const smartBinService = new SmartBinService();

// List all smart bins
router.get('/', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await smartBinService.findAll(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Register a new smart bin
router.post('/', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bin = await smartBinService.register(req.body);
    res.status(201).json(bin);
  } catch (error) {
    next(error);
  }
});

// Get bin by device ID
router.get('/device/:deviceId', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bin = await smartBinService.findByDeviceId(req.params.deviceId);
    if (!bin) return res.status(404).json({ error: 'Smart bin not found' });
    res.json(bin);
  } catch (error) {
    next(error);
  }
});

// Get events for a bin
router.get('/:id/events', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await smartBinService.getEvents(req.params.id);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Update bin status
router.patch('/device/:deviceId/status', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bin = await smartBinService.updateStatus(req.params.deviceId, req.body.status);
    res.json(bin);
  } catch (error) {
    next(error);
  }
});

export default router;
