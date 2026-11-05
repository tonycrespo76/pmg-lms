import { NextResponse } from "next/server";

export function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const logoUrl = new URL("/pmg-logo.png", request.url).toString();
  const loginUrl = new URL("/login", request.url).toString();
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f5f7;font-family:Arial,sans-serif;color:#1d2a3a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#142b4a;padding:28px;text-align:center;">
            <img src="${logoUrl}" alt="PMG Learning" width="190" style="display:block;margin:0 auto;max-width:190px;height:auto;">
          </td></tr>
          <tr><td style="padding:40px 42px;">
            <p style="margin:0 0 8px;color:#8a6a1f;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Welcome to PMG Learning</p>
            <h1 style="margin:0 0 18px;font-size:30px;line-height:1.2;color:#142b4a;">Welcome, Learner</h1>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">Your learning account is ready. Start by signing in with your email address, then enter the secure sign-in code sent to your inbox.</p>
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">
              <tr><td style="border-radius:6px;background:#c9a227;">
                <a href="${loginUrl}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">Sign in to PMG Learning</a>
              </td></tr>
            </table>
            <p style="margin:0;font-size:14px;line-height:1.65;color:#64748b;">If you did not expect this email, please contact your training administrator.</p>
          </td></tr>
          <tr><td style="background:#f0eee8;padding:20px 42px;text-align:center;color:#64748b;font-size:12px;">
            PMG National Training Academy
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
