import { prisma } from "@/lib/prisma";
import { appConfig } from "@/lib/utils";
import { sendVerificationEmail } from "@/server/email";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, name, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser && existingUser.passwordHash) {
    return {
      success: false as const,
      message: "An account with this email already exists. Please login instead.",
    };
  }

  const passwordHash = await hash(password, 12);

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          passwordHash,
          emailVerified: null,
        },
      })
    : await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
      });

  const verification = await createVerificationToken(email);
  await sendVerificationEmail(email, verification.token);

  return {
    success: true as const,
    message: "Account created. Check your email to verify your address.",
    userId: user.id,
  };
}

export async function createVerificationToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + appConfig.verificationTokenExpiryHours * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  return prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });
}

export async function verifyEmailToken(token: string) {
  if (!token) {
    return { success: false as const, message: "Verification token is missing." };
  }

  const verification = await prisma.verificationToken.findUnique({ where: { token } });

  if (!verification) {
    return { success: false as const, message: "Verification link is invalid or has already been used." };
  }

  if (verification.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return { success: false as const, message: "Verification link has expired. Please request a new one." };
  }

  await prisma.user.update({
    where: { email: verification.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return { success: true as const, message: "Email verified. You can now login." };
}
