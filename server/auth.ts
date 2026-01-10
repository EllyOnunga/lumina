import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy, Profile as GoogleProfile, VerifyCallback } from "passport-google-oauth20";
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from "passport-github2";
import { type Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { insertUserSchema, User as SelectUser } from "@shared/schema";
import { sendWelcomeEmail } from "./email";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface User extends SelectUser { }
    }
}

declare module "express-session" {
    interface SessionData {
        csrfToken?: string;
    }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedPasswordBuf = Buffer.from(hashed, "hex");
    const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

import { sessionConfig } from "./security";

export function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
        ...sessionConfig,
        store: storage.sessionStore,
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            const user = await storage.getUserByUsername(username);
            if (!user || !(await comparePasswords(password || "", user.password || ""))) {
                return done(null, false);
            } else {
                return done(null, user);
            }
        }),
    );

    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: "/api/auth/google/callback",
                },
                async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
                    try {
                        let user = await storage.getUserByGoogleId(profile.id);
                        if (!user) {
                            const email = profile.emails?.[0].value;
                            if (email) {
                                user = await storage.getUserByEmail(email);
                            }

                            if (!user) {
                                user = await storage.createUser({
                                    username: profile.displayName || profile.id,
                                    email,
                                    googleId: profile.id,
                                    isEmailVerified: true, // Google emails are usually verified
                                });
                            } else {
                                user = await storage.updateUser(user.id, { googleId: profile.id });
                            }
                        }
                        return done(null, user);
                    } catch (err) {
                        return done(err);
                    }
                }
            )
        );
    }

    // GitHub OAuth Strategy
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        passport.use(
            new GitHubStrategy(
                {
                    clientID: process.env.GITHUB_CLIENT_ID,
                    clientSecret: process.env.GITHUB_CLIENT_SECRET,
                    callbackURL: "/api/auth/github/callback",
                },
                async (_accessToken: string, _refreshToken: string, profile: GitHubProfile, done: VerifyCallback) => {
                    try {
                        let user = await storage.getUserByGithubId(profile.id);
                        if (!user) {
                            const email = profile.emails?.[0].value;
                            if (email) {
                                user = await storage.getUserByEmail(email);
                            }

                            if (!user) {
                                user = await storage.createUser({
                                    username: profile.username || profile.id,
                                    email,
                                    githubId: profile.id,
                                    isEmailVerified: !!email,
                                });
                            } else {
                                user = await storage.updateUser(user.id, { githubId: profile.id });
                            }
                        }
                        return done(null, user);
                    } catch (err) {
                        return done(err);
                    }
                }
            )
        );
    }

    passport.serializeUser((user, done) => done(null, (user as SelectUser).id));
    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            if (!user) {
                return done(null, false);
            }
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/register", async (req, res, next) => {
        try {
            const result = insertUserSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json(result.error);
            }

            const existingUser = await storage.getUserByUsername(result.data.username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            if (result.data.email) {
                const existingEmail = await storage.getUserByEmail(result.data.email);
                if (existingEmail) {
                    return res.status(400).send("Email already in use");
                }
            }

            if (!result.data.password) {
                return res.status(400).send("Password is required");
            }

            const hashedPassword = await hashPassword(result.data.password);
            const user = await storage.createUser({
                ...result.data,
                password: hashedPassword,
            });

            // Send welcome email (non-blocking)
            if (user.email) {
                sendWelcomeEmail(user.email, user.username).catch(err =>
                    console.error("Failed to send welcome email:", err)
                );
            }

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(user);
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.status(200).json(req.user);
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
    });

    // OAuth Routes
    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get(
        "/api/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/auth" }),
        (_req, res) => res.redirect("/")
    );

    app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
    app.get(
        "/api/auth/github/callback",
        passport.authenticate("github", { failureRedirect: "/auth" }),
        (_req, res) => res.redirect("/")
    );
}
