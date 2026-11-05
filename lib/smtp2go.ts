export async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.SMTP2GO_API_KEY;
  const sender = process.env.SMTP2GO_SENDER;
  if (!apiKey || !sender) throw new Error("SMTP2GO_API_KEY and SMTP2GO_SENDER must be configured");

  const response = await fetch("https://api.smtp2go.com/v3/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      to: [email],
      sender,
      subject: "Your PMG Learning sign-in code",
      text_body: `Your PMG Learning sign-in code is ${code}. It expires in 10 minutes.`,
      html_body: `<p>Your PMG Learning sign-in code is:</p><h1 style="letter-spacing:6px">${code}</h1><p>This code expires in 10 minutes.</p>`,
    }),
  });
  const result = await response.json();
  if (!response.ok || result?.data?.succeeded === 0) {
    throw new Error("SMTP2Go rejected the message");
  }
}
