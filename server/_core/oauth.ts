import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Mock OAuth routes for local development and demo production
  // In a real app, you would use a real provider (Google, Auth0, etc.)
  if (true || process.env.NODE_ENV === "development") {
    console.log("[OAuth] Mock routes registered");

    // 1. Mock Login Portal (Redirects back immediately)
    app.get("/oauth/app-auth", (req: Request, res: Response) => {
      const redirectUri = getQueryParam(req, "redirectUri");
      const state = getQueryParam(req, "state");

      if (!redirectUri || !state) {
        res.status(400).send("Missing parameters");
        return;
      }

      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set("code", "MOCK_CODE_123");
      callbackUrl.searchParams.set("state", state);

      res.redirect(callbackUrl.toString());
    });

    // 2. Mock Token Exchange
    app.post("/webdev.v1.WebDevAuthPublicService/ExchangeToken", (req: Request, res: Response) => {
      res.json({
        accessToken: "MOCK_ACCESS_TOKEN",
        refreshToken: "MOCK_REFRESH_TOKEN",
        expiresIn: 3600,
      });
    });

    // 3. Mock User Info
    app.post("/webdev.v1.WebDevAuthPublicService/GetUserInfo", (req: Request, res: Response) => {
      res.json({
        openId: process.env.OWNER_OPEN_ID || "local-owner", // Match seed-db
        name: "Local Admin",
        email: "admin@example.com",
        platform: "email",
        loginMethod: "email",
      });
    });

    // 4. Mock User Info with JWT (used for session sync)
    app.post("/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt", (req: Request, res: Response) => {
      res.json({
        openId: process.env.OWNER_OPEN_ID || "local-owner",
        name: "Local Admin",
        email: "admin@example.com",
        platform: "email",
        loginMethod: "email",
      });
    });
  }

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
