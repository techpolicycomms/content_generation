import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { authGuard } from './middleware/auth-guard';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import collectionRoutes from './modules/collection/collection.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import smartbinRoutes from './modules/smartbins/smartbin.routes';
import smartbinWebhook from './modules/smartbins/webhook.controller';
import eventRoutes from './modules/events/event.routes';
import orderRoutes from './modules/orders/order.routes';
import reportingRoutes from './modules/reporting/export.controller';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'greenloop-backend' });
});

// Public routes
app.use('/api/auth', authRoutes);

// Smart bin webhook (authenticated by device API key, not JWT)
app.use('/api/smartbins', smartbinWebhook);

// Protected routes (JWT required)
app.use('/api/users', authGuard, userRoutes);
app.use('/api/events', authGuard, eventRoutes);
app.use('/api/collection', authGuard, collectionRoutes);
app.use('/api/inventory', authGuard, inventoryRoutes);
app.use('/api/orders', authGuard, orderRoutes);
app.use('/api/smartbins', authGuard, smartbinRoutes);
app.use('/api/reports', authGuard, reportingRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.PORT || 4000;

app.listen(PORT, () => {
  console.log(`GreenLoop backend running on port ${PORT}`);
});

export default app;
