import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { roleGuard } from '../../middleware/role-guard';

const router = Router();
const orderService = new OrderService();

router.get('/', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await orderService.findAll(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.post('/', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', roleGuard('ops_manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.updateStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
