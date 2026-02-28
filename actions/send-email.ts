"use server";

import { Resend } from "resend";
import type { ReactElement } from "react";

type SendEmailParams = {
  to: string;
  subject: string;
  react: ReactElement;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  try {
    const data = await resend.emails.send({
      from: "Spendly <onboarding@resend.dev>",
      to,
      subject,
      react,
    });
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}