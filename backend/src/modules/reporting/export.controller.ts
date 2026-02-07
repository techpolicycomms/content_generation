import { Router, Request, Response, NextFunction } from 'express';
import { ImpactService } from './impact.service';
import { roleGuard } from '../../middleware/role-guard';

const router = Router();
const impactService = new ImpactService();

// Overall impact dashboard data
router.get('/impact', roleGuard('city_official', 'organiser'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const impact = await impactService.getOverallImpact();
    res.json(impact);
  } catch (error) {
    next(error);
  }
});

// Event-specific impact
router.get('/impact/event/:eventId', roleGuard('organiser'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const impact = await impactService.getEventImpact(req.params.eventId);
    res.json(impact);
  } catch (error) {
    next(error);
  }
});

// CSV export of overall impact data
router.get('/export/csv', roleGuard('city_official'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const impact = await impactService.getOverallImpact();

    const csvRows = [
      'Metric,Value',
      `Total Events,${impact.totalEvents}`,
      `Total Weight Collected (kg),${impact.collection.totalWeightKg}`,
      `Total Lanyards,${impact.collection.totalLanyards}`,
      `Total Plastic Items,${impact.collection.totalPlastic}`,
      `Total Metal Items,${impact.collection.totalMetal}`,
      `Total Glass Items,${impact.collection.totalGlass}`,
      `Total Batches Processed,${impact.processing.totalBatches}`,
      `Total Processed Weight (kg),${impact.processing.totalProcessedKg}`,
      `Total Orders,${impact.sales.totalOrders}`,
      `Total Revenue,${impact.sales.totalRevenue}`,
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=greenloop-impact.csv');
    res.send(csvRows.join('\n'));
  } catch (error) {
    next(error);
  }
});

// JSON export
router.get('/export/json', roleGuard('city_official'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const impact = await impactService.getOverallImpact();
    res.setHeader('Content-Disposition', 'attachment; filename=greenloop-impact.json');
    res.json(impact);
  } catch (error) {
    next(error);
  }
});

export default router;
