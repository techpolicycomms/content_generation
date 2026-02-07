import { Router, Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { roleGuard } from '../../middleware/role-guard';

const router = Router();
const inventoryService = new InventoryService();

// --- Batches ---

router.get('/batches', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await inventoryService.listBatches(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/batches', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batch = await inventoryService.createBatch(req.body);
    res.status(201).json(batch);
  } catch (error) {
    next(error);
  }
});

router.patch('/batches/:id/status', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batch = await inventoryService.updateBatchStatus(req.params.id, req.body.status);
    res.json(batch);
  } catch (error) {
    next(error);
  }
});

// --- Inventory Items ---

router.get('/items', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await inventoryService.listItems(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/items/:id', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.getItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.post('/items', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.patch('/items/:id', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.updateItem(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

export default router;
