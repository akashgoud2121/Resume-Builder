import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTPEmail } from '@/lib/email';

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Delete any existing OTP for this email
    await prisma.oTPVerification.deleteMany({
      where: { email },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await prisma.oTPVerification.create({
      data: {
        email,
        otp,
        expires: expiresAt,
      },
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully to your email',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while resending OTP' },
      { status: 500 }
    );
  }
}









