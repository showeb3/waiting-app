// Mock token exchange endpoint
// Path: /webdev.v1.WebDevAuthPublicService/ExchangeToken
export const onRequest: PagesFunction = async () => {
    return new Response(
        JSON.stringify({
            accessToken: "MOCK_ACCESS_TOKEN",
            refreshToken: "MOCK_REFRESH_TOKEN",
            expiresIn: 3600,
        }),
        {
            headers: { "Content-Type": "application/json" },
        }
    );
};
