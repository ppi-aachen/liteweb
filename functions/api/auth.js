export async function onRequest(context) {
  const { env } = context;
  const client_id = env.GITHUB_CLIENT_ID;

  // Build the callback URL dynamically based on the request origin
  const redirect_uri = new URL(context.request.url).origin + "/api/callback";
  
  // Redirect users to GitHub OAuth authorization page
  return Response.redirect(
    `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo&redirect_uri=${redirect_uri}`,
    302
  );
}
