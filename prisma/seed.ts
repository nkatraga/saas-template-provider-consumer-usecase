import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { addDays, setHours, setMinutes } from "date-fns";

// [Template] — Seed data script. Creates initial admin user and sample data for development.

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create provider
  const providerPassword = await hash("password123", 12);
  const providerUser = await prisma.user.create({
    data: {
      email: "provider@example.com",
      name: "Ms. Johnson",
      passwordHash: providerPassword,
      role: "PROVIDER",
      phone: "(555) 100-0001",
    },
  });

  const provider = await prisma.provider.create({
    data: {
      userId: providerUser.id,
      businessName: "Johnson Services",
    },
  });

  await prisma.providerSettings.create({
    data: {
      providerId: provider.id,
      showConsumerNames: true,
      showContactEmail: true,
      showContactPhone: true,
      requireProviderApproval: false,
      minAdvanceHours: 24,
      maxAdvanceDays: 30,
      allowCrossDayExchanges: true,
      reminderEnabled: true,
      reminderDayBefore: true,
      reminderHoursBefore: 2,
      exchangeInstructions:
        "Contact the other consumer or their parent to arrange an exchange. Once you both agree, confirm the exchange here and the schedule will update automatically.",
    },
  });

  // Create consumers
  const consumerPassword = await hash("password123", 12);

  const consumers = [
    { name: "Alice Chen", email: "alice@example.com", phone: "(555) 200-0001", serviceType: "General", duration: 30 },
    { name: "Bob Martinez", email: "bob@example.com", phone: "(555) 200-0002", serviceType: "General", duration: 30 },
    { name: "Charlie Kim", email: "charlie@example.com", phone: "(555) 200-0003", serviceType: "General", duration: 45 },
    { name: "Diana Patel", email: "diana@example.com", phone: "(555) 200-0004", serviceType: "General", duration: 30 },
    { name: "Ethan Brown", email: "ethan@example.com", phone: "(555) 200-0005", serviceType: "General", duration: 60 },
  ];

  const createdConsumers = [];

  for (const s of consumers) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        name: s.name,
        passwordHash: consumerPassword,
        role: "CONSUMER",
        phone: s.phone,
        preferredContact: "email",
      },
    });

    const consumer = await prisma.consumer.create({
      data: {
        userId: user.id,
        providerId: provider.id,
        serviceType: s.serviceType,
        bookingDuration: s.duration,
      },
    });

    createdConsumers.push(consumer);
  }

  // Create bookings for the next 4 weeks
  // Each consumer has a weekly booking at a fixed time
  const bookingTimes = [
    { dayOffset: 1, hour: 15, minute: 0 },  // Mon 3:00 PM
    { dayOffset: 1, hour: 16, minute: 0 },  // Mon 4:00 PM
    { dayOffset: 3, hour: 15, minute: 30 }, // Wed 3:30 PM
    { dayOffset: 3, hour: 16, minute: 30 }, // Wed 4:30 PM
    { dayOffset: 5, hour: 10, minute: 0 },  // Fri 10:00 AM
  ];

  const today = new Date();
  // Find next Monday
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);

  for (let week = 0; week < 4; week++) {
    for (let i = 0; i < createdConsumers.length; i++) {
      const consumer = createdConsumers[i];
      const lt = bookingTimes[i];
      const duration = consumers[i].duration;

      const baseDate = addDays(nextMonday, week * 7 + lt.dayOffset - 1);
      const startTime = setMinutes(setHours(baseDate, lt.hour), lt.minute);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      await prisma.booking.create({
        data: {
          consumerId: consumer.id,
          providerId: provider.id,
          startTime,
          endTime,
          status: "scheduled",
        },
      });
    }
  }

  // Create a parent account
  const parentPassword = await hash("password123", 12);
  const parentUser = await prisma.user.create({
    data: {
      email: "parent@example.com",
      name: "Mrs. Chen (Alice's Mom)",
      passwordHash: parentPassword,
      role: "PARENT",
      phone: "(555) 300-0001",
      preferredContact: "both",
    },
  });

  // Link parent to Alice
  await prisma.consumer.update({
    where: { id: createdConsumers[0].id },
    data: { parentId: parentUser.id },
  });

  console.log("Seed complete!");
  console.log("");
  console.log("Test accounts:");
  console.log("  Provider: provider@example.com / password123");
  console.log("  Consumer (Alice): alice@example.com / password123");
  console.log("  Consumer (Bob): bob@example.com / password123");
  console.log("  Consumer (Charlie): charlie@example.com / password123");
  console.log("  Consumer (Diana): diana@example.com / password123");
  console.log("  Consumer (Ethan): ethan@example.com / password123");
  console.log("  Parent (Alice's Mom): parent@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
