import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// [Template] — Invite acceptance flow. Validates invite token, creates user account, links to inviter.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      provider: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 }
    );
  }

  if (invite.acceptedAt) {
    return NextResponse.json(
      { error: "This invitation has already been used" },
      { status: 400 }
    );
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This invitation has expired" },
      { status: 400 }
    );
  }

  // Check if the recipient already has an account (for UI adaptation)
  const existingUser = await prisma.user.findUnique({
    where: { email: invite.recipientEmail.toLowerCase().trim() },
  });
  const recipientHasAccount = !!(existingUser?.passwordHash);

  return NextResponse.json({
    recipientEmail: invite.recipientEmail,
    role: invite.role,
    providerName: invite.provider.user.name,
    businessName: invite.provider.businessName,
    recipientHasAccount,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await req.json();
  const { name, email: rawEmail, password, phone, preferredContact, serviceType } = body;
  const email = rawEmail?.toLowerCase().trim();

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { provider: true },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 }
    );
  }

  if (invite.acceptedAt) {
    return NextResponse.json(
      { error: "This invitation has already been used" },
      { status: 400 }
    );
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This invitation has expired" },
      { status: 400 }
    );
  }

  // Check if a user already exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (user.passwordHash) {
      // User already has a full account — check if already enrolled with this provider
      const existingEnrollment = await prisma.consumer.findFirst({
        where: { userId: user.id, providerId: invite.providerId },
      });

      if (existingEnrollment) {
        return NextResponse.json(
          { error: "You are already enrolled with this provider." },
          { status: 409 }
        );
      }

      // Existing user, not enrolled with this provider → create new enrollment
      if (invite.role === "CONSUMER") {
        await prisma.consumer.create({
          data: {
            userId: user.id,
            providerId: invite.providerId,
            serviceType: serviceType || "General",
          },
        });
      }

      // Mark invite as accepted
      await prisma.invite.update({
        where: { token },
        data: {
          acceptedAt: new Date(),
          recipientId: user.id,
        },
      });

      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        alreadyHasAccount: true,
      });
    }

    // Placeholder user exists (no password) — set their password and update info
    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);
    user = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        name,
        phone: phone || user.phone,
        preferredContact: preferredContact || user.preferredContact,
        emailVerified: true,
      },
    });

    // Update consumer profile if it exists
    const existingConsumer = await prisma.consumer.findFirst({
      where: { userId: user.id, providerId: invite.providerId },
    });
    if (existingConsumer && serviceType) {
      await prisma.consumer.update({
        where: { id: existingConsumer.id },
        data: { serviceType },
      });
    } else if (!existingConsumer && invite.role === "CONSUMER") {
      await prisma.consumer.create({
        data: {
          userId: user.id,
          providerId: invite.providerId,
          serviceType: serviceType || "General",
        },
      });
    }
  } else {
    // No existing user — create fresh
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: invite.role,
        phone: phone || null,
        preferredContact: preferredContact || "email",
        emailVerified: true,
      },
    });

    if (invite.role === "CONSUMER") {
      await prisma.consumer.create({
        data: {
          userId: user.id,
          providerId: invite.providerId,
          serviceType: serviceType || "General",
        },
      });
    }
  }

  // Mark invite as accepted
  await prisma.invite.update({
    where: { token },
    data: {
      acceptedAt: new Date(),
      recipientId: user.id,
    },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
