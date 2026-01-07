// Mock user info endpoint
// Path: /webdev.v1.WebDevAuthPublicService/GetUserInfo
export const onRequest: PagesFunction = async () => {
    return new Response(
        JSON.stringify({
            openId: "local-owner", // Match the seed data
            name: "Local Admin",
            email: "admin@example.com",
            platform: "email",
            loginMethod: "email",
        }),
        {
            headers: { "Content-Type": "application/json" },
        }
    );
};
