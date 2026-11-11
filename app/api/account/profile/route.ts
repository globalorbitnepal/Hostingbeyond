import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import { crossOriginBrowserMutationBlocked } from "@/lib/http/same-origin-mutation";
import { prisma } from "@/lib/prisma";
import {
  isAllowedCurrency,
  publicProfile,
  readCustomerProfile,
  sanitizeLine,
  sanitizePhone,
  writeCustomerProfile,
  type NotificationPrefs,
  type ProfileShare,
} from "@/lib/panel/customer-profile";
import { loadProfileSnapshot } from "@/lib/panel/load-profile-snapshot";
import { generateTotpSecret, totpUri, verifyTotpCode } from "@/lib/panel/totp";
import {
  CUSTOMER_SESSION_COOKIE,
  hashToken,
  verifyCustomerJwt,
} from "@/lib/customer/session";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  return NextResponse.json(await loadProfileSnapshot(user));
}

type ActionBody =
  | {
      action: "save-personal";
      name?: string;
      address?: string;
      phone?: string;
      company?: string;
      displayCurrency?: string;
    }
  | {
      action: "save-account";
      recoveryEmail?: string;
    }
  | { action: "save-notifications"; notifications: NotificationPrefs }
  | { action: "set-ai-memory"; enabled: boolean }
  | {
      action: "set-integration";
      id: "gitlab" | "googleAds";
      connected: boolean;
    }
  | { action: "totp-start" }
  | { action: "totp-confirm"; code: string }
  | { action: "totp-disable"; code: string }
  | { action: "unlink-oauth"; provider: string }
  | { action: "revoke-session"; sessionId: string }
  | { action: "share"; direction: "request" | "give"; email: string }
  | { action: "share-revoke"; id: string }
  | { action: "delete-account"; confirmEmail: string };

export async function POST(request: Request) {
  if (crossOriginBrowserMutationBlocked(request, { strict: true })) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ActionBody | null;
  if (!body || typeof body !== "object" || !("action" in body)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const profile = await readCustomerProfile(user.id);

  if (body.action === "save-personal") {
    const name = sanitizeLine(body.name ?? user.name ?? "", 80);
    await prisma.customerUser.update({
      where: { id: user.id },
      data: { name: name || null },
    });
    profile.address = sanitizeLine(body.address ?? profile.address, 200);
    profile.phone = sanitizePhone(body.phone ?? profile.phone);
    profile.company = sanitizeLine(body.company ?? profile.company, 80);
    if (body.displayCurrency && isAllowedCurrency(body.displayCurrency)) {
      profile.displayCurrency = body.displayCurrency;
    }
    await writeCustomerProfile(user.id, profile);
    return NextResponse.json({
      ok: true,
      profile: publicProfile(profile),
      name,
    });
  }

  if (body.action === "save-account") {
    const recovery = sanitizeLine(body.recoveryEmail ?? "", 120).toLowerCase();
    if (recovery && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recovery)) {
      return NextResponse.json(
        { error: "Enter a valid recovery email." },
        { status: 400 },
      );
    }
    profile.recoveryEmail = recovery;
    await writeCustomerProfile(user.id, profile);
    return NextResponse.json({ ok: true, profile: publicProfile(profile) });
  }

  if (body.action === "save-notifications") {
    profile.notifications = body.notifications;
    await writeCustomerProfile(user.id, profile);
    return NextResponse.json({ ok: true, profile: publicProfile(profile) });
  }

  if (body.action === "set-ai-memory") {
    profile.aiMemoryEnabled = Boolean(body.enabled);
    await writeCustomerProfile(user.id, profile);
    return NextResponse.json({ ok: true, profile: publicProfile(profile) });
  }

  if (body.action === "set-integration") {
    profile.integrations[body.id] = Boolean(body.connected);
    await writeCustomerProfile(user.id, profile);
    return NextResponse.json({ ok: true, profile: publicProfile(profile) });
  }

  if (body.action === "totp-start") {
    const secret = generateTotpSecret();
    profile.totpPendingSecret = secret;
    await writeCustomerProfile(user.id, profile);
    return NextResponse.json({
      ok: true,
      secret,
      uri: totpUri(secret, user.email),
    });
  }

  if (body.action === "totp-confirm") {
    const secret = profile.totpPendingSecret;
    if (!secret) {
      return NextResponse.json(
        { error: "Start authenticator setup first." },
        { status: 400 },
      );
    }
    if (!verifyTotpCode(secret, body.code ?? "")) {
      return NextResponse.json(
        { error: "That code is not valid. Try the latest code." },
        { status: 400 },
      );
    }
    profile.totpEnabled = true;
    profile.totpSecret = secret;
    profile.totpPendingSecret = null;
    await writeCustomerProfile(user.id, profile);
    return NextResponse.json({ ok: true, profile: publicProfile(profile) });
  }

  if (body.action === "totp-disable") {
    if (
      !profile.totpSecret ||
      !verifyTotpCode(profile.totpSecret, body.code ?? "")
    ) {
      return NextResponse.json(
        { error: "Enter a valid authenticator code to turn 2FA off." },
        { status: 400 },
      );
    }
    profile.totpEnabled = false;
    profile.totpSecret = null;
    profile.totpPendingSecret = null;
    await writeCustomerProfile(user.id, profile);
    return NextResponse.json({ ok: true, profile: publicProfile(profile) });
  }

  if (body.action === "unlink-oauth") {
    const provider = body.provider.trim().toLowerCase();
    const remaining = await prisma.customerOAuthAccount.count({
      where: { userId: user.id },
    });
    const hasPassword = Boolean(user.passwordHash);
    if (!hasPassword && remaining <= 1) {
      return NextResponse.json(
        {
          error: "Add a password before unlinking your last sign-in method.",
        },
        { status: 400 },
      );
    }
    await prisma.customerOAuthAccount.deleteMany({
      where: { userId: user.id, provider },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "revoke-session") {
    const jar = await cookies();
    const current = await verifyCustomerJwt(
      jar.get(CUSTOMER_SESSION_COOKIE)?.value,
    );
    const currentHash = current ? hashToken(current.sid) : null;
    const row = await prisma.customerSession.findFirst({
      where: { id: body.sessionId, userId: user.id },
    });
    if (!row) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 },
      );
    }
    if (row.tokenHash === currentHash) {
      return NextResponse.json(
        { error: "You cannot sign out the session you are using here." },
        { status: 400 },
      );
    }
    await prisma.customerSession.delete({ where: { id: row.id } });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "share") {
    const email = sanitizeLine(body.email, 120).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }
    if (email === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "You already own this account." },
        { status: 400 },
      );
    }
    const share: ProfileShare = {
      id: crypto.randomUUID(),
      email,
      direction: body.direction,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    profile.shares = [share, ...profile.shares].slice(0, 40);
    await writeCustomerProfile(user.id, profile);
    const other = await prisma.customerUser.findUnique({
      where: { email },
      select: { id: true },
    });
    if (other) {
      const otherProfile = await readCustomerProfile(other.id);
      otherProfile.shares = [
        {
          ...share,
          email: user.email,
          direction: body.direction === "give" ? "request" : "give",
        },
        ...otherProfile.shares,
      ].slice(0, 40);
      await writeCustomerProfile(other.id, otherProfile);
    }
    return NextResponse.json({ ok: true, profile: publicProfile(profile) });
  }

  if (body.action === "share-revoke") {
    profile.shares = profile.shares.filter((row) => row.id !== body.id);
    await writeCustomerProfile(user.id, profile);
    return NextResponse.json({ ok: true, profile: publicProfile(profile) });
  }

  if (body.action === "delete-account") {
    if (body.confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Type your email address to confirm deletion." },
        { status: 400 },
      );
    }
    try {
      await prisma.customerUser.delete({ where: { id: user.id } });
    } catch {
      return NextResponse.json(
        {
          error:
            "This account still has linked records. Contact support to close it.",
        },
        { status: 409 },
      );
    }
    const response = NextResponse.json({ ok: true, deleted: true });
    response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
