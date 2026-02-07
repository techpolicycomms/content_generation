import prisma from '../../config/db';
import bcrypt from 'bcryptjs';

/**
 * Seed script for development/demo data.
 * Run: npm run seed
 */
async function main() {
  console.log('Seeding GreenLoop database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@greenloop.io' },
    update: {},
    create: {
      email: 'admin@greenloop.io',
      password: adminPassword,
      name: 'GreenLoop Admin',
      provider: 'local',
    },
  });
  await prisma.userRole.upsert({
    where: { userId_role: { userId: admin.id, role: 'admin' } },
    update: {},
    create: { userId: admin.id, role: 'admin' },
  });

  // Create organiser user
  const orgPassword = await bcrypt.hash('organiser123', 12);
  const organiser = await prisma.user.upsert({
    where: { email: 'organiser@greenloop.io' },
    update: {},
    create: {
      email: 'organiser@greenloop.io',
      password: orgPassword,
      name: 'Demo Organiser',
      provider: 'local',
    },
  });
  await prisma.userRole.upsert({
    where: { userId_role: { userId: organiser.id, role: 'organiser' } },
    update: {},
    create: { userId: organiser.id, role: 'organiser' },
  });

  // Create volunteer user
  const volPassword = await bcrypt.hash('volunteer123', 12);
  const volunteer = await prisma.user.upsert({
    where: { email: 'volunteer@greenloop.io' },
    update: {},
    create: {
      email: 'volunteer@greenloop.io',
      password: volPassword,
      name: 'Demo Volunteer',
      provider: 'local',
    },
  });
  await prisma.userRole.upsert({
    where: { userId_role: { userId: volunteer.id, role: 'volunteer' } },
    update: {},
    create: { userId: volunteer.id, role: 'volunteer' },
  });

  // Create a demo event
  const event = await prisma.event.upsert({
    where: { id: 'demo-event-001' },
    update: {},
    create: {
      id: 'demo-event-001',
      title: 'Community Recycling Day',
      description: 'A neighbourhood event to collect and sort recyclables.',
      date: new Date('2026-03-15T09:00:00Z'),
      location: 'City Park, Main Street',
      latitude: 51.5074,
      longitude: -0.1278,
      status: 'planned',
      organiserId: organiser.id,
    },
  });

  // Add volunteer as participant
  await prisma.eventParticipant.upsert({
    where: { eventId_userId: { eventId: event.id, userId: volunteer.id } },
    update: {},
    create: { eventId: event.id, userId: volunteer.id, role: 'volunteer' },
  });

  // Create a demo smart bin
  await prisma.smartBin.upsert({
    where: { deviceId: 'bin-demo-001' },
    update: {},
    create: {
      deviceId: 'bin-demo-001',
      apiKey: 'demo-api-key-001',
      name: 'Park Entrance Recycling Bin',
      latitude: 51.5074,
      longitude: -0.1278,
      binType: 'recycling',
      fillLevel: 35,
      status: 'active',
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
