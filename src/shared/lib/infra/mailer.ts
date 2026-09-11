import "server-only";
import nodemailer from "nodemailer";
import { env } from "./env";
import { logger } from "./logger";

export interface MailInput { to: string; subject: string; text: string; html?: string }

export interface SmtpConnectionOptions {
  host: string;
  port: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

/** ไม่มี SMTP → เขียนลง log ระดับ info แล้วคืน delivered:false — ระบบต้องไม่ล้มเพราะส่งอีเมลไม่ได้ */
export async function sendMail(input: MailInput, customSmtp?: SmtpConnectionOptions): Promise<{ delivered: boolean }> {
  const e = env();
  const host = customSmtp?.host || e.SMTP_HOST;
  const port = customSmtp?.port || e.SMTP_PORT;
  const secure = customSmtp?.secure !== undefined ? customSmtp.secure : port === 465;
  const user = customSmtp?.user || e.SMTP_USER;
  const pass = customSmtp?.pass || e.SMTP_PASS;
  const from = customSmtp?.from || e.SMTP_FROM;

  if (!host) {
    logger.info("mail (no SMTP, logged only)", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false };
  }

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
      connectionTimeout: 10000,
    });
    await transport.sendMail({ from, to: input.to, subject: input.subject, text: input.text, html: input.html });
    return { delivered: true };
  } catch (err) {
    logger.error("mail send failed", { to: input.to, err: err instanceof Error ? err.message : String(err) });
    return { delivered: false };
  }
}

/** ทดสอบเชื่อมต่อและส่งอีเมลทดสอบ */
export async function testSmtpConnection(opts: SmtpConnectionOptions, to: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const transport = nodemailer.createTransport({
      host: opts.host,
      port: opts.port,
      secure: opts.secure !== undefined ? opts.secure : opts.port === 465,
      auth: opts.user && opts.pass ? { user: opts.user, pass: opts.pass } : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    await transport.verify();

    const fromAddress = opts.from || opts.user || "no-reply@fms-portal.local";
    await transport.sendMail({
      from: fromAddress,
      to,
      subject: "ทดสอบการเชื่อมต่อระบบอีเมล (FMS Portal SMTP Test)",
      text: "การตั้งค่าระบบส่งอีเมล (SMTP) บนระบบ FMS Portal ทำงานได้อย่างถูกต้องสมบูรณ์",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; line-height: 1.6; color: #1f2937; max-width: 560px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #059669; margin-top: 0; display: flex; align-items: center; gap: 8px;">✓ การเชื่อมต่อ SMTP สำเร็จ</h2>
          <p>นี่คือข้อความทดสอบจากระบบ <strong>FMS Portal & Admin Platform</strong></p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Server:</strong> ${opts.host}:${opts.port}</p>
            <p style="margin: 4px 0;"><strong>User:</strong> ${opts.user || "(None)"}</p>
            <p style="margin: 4px 0;"><strong>ผู้ส่ง:</strong> ${fromAddress}</p>
          </div>
          <p style="font-size: 14px; color: #4b5563;">ระบบอีเมลของคุณพร้อมสำหรับการส่งอีเมลตั้งรหัสผ่าน การแจ้งเตือน และข่าวสารต่างๆ เรียบร้อยแล้ว</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0;">ส่งเมื่อ: ${new Date().toLocaleString("th-TH")}</p>
        </div>
      `,
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("SMTP test failed", { err: message, host: opts.host, user: opts.user });
    return { ok: false, message };
  }
}
