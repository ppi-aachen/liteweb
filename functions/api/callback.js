export async function onRequest(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  // Exchange authorization code for an access token
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const result = await response.json();

  if (result.error) {
    return new Response(JSON.stringify(result), { status: 400 });
  }

  // Render HTML that sends the token back to Decap CMS via postMessage
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Authorized</title>
    </head>
    <body>
      <script>
        const receiveMessage = (e) => {
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify({
              token: result.access_token,
              provider: "github",
            })}',
            e.origin
          );
        };
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
