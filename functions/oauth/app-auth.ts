// Mock OAuth app-auth endpoint for Cloudflare Pages
// Path: /oauth/app-auth
export const onRequest: PagesFunction = async (context) => {
    const url = new URL(context.request.url);
    const redirectUri = url.searchParams.get("redirectUri");
    const state = url.searchParams.get("state");

    if (!redirectUri || !state) {
        return new Response("Missing parameters", { status: 400 });
    }

    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set("code", "MOCK_CODE_123");
    callbackUrl.searchParams.set("state", state);

    return Response.redirect(callbackUrl.toString(), 302);
};
