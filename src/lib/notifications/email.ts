type SendEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export async function sendEmail(payload: SendEmailPayload): Promise<void> {
  const apiUrl = getRequiredEnv("EMAIL_OTP_API_URL");
  const apiKey = getRequiredEnv("EMAIL_OTP_API_KEY");
  const fromEmail = process.env.EMAIL_OTP_FROM_EMAIL ?? "no-reply@fixora.app";
  const fromName = process.env.EMAIL_OTP_FROM_NAME ?? "Fixora";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: payload.to }],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Email API failed (${response.status}): ${body}`);
  }
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const subject = "Your Fixora verification code";
  const text = `Your Fixora OTP is ${otp}. It expires in 5 minutes.`;
  const html = `<p>Your Fixora OTP is <strong>${otp}</strong>.</p><p>It expires in 5 minutes.</p>`;

  await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrlBase = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${resetUrlBase}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const subject = "Reset your Fixora password";
  const text = `Use this link to reset your Fixora password: ${resetUrl}. The link expires in 15 minutes.`;
  const html = `<p>Use this link to reset your Fixora password:</p><p><a href=\"${resetUrl}\">Reset Password</a></p><p>This link expires in 15 minutes.</p>`;

  await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendCredentialsEmail(email: string, password: string): Promise<void> {
  const subject = "Your Fixora account credentials";
  const text = `Your Fixora account has been created. Email: ${email}. Password: ${password}. Please change it after first login.`;
  const html = `<p>Your Fixora account has been created.</p><p>Email: <strong>${email}</strong><br/>Password: <strong>${password}</strong></p><p>Please change it after first login.</p>`;

  await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}
