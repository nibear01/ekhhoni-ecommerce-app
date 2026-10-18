import { getAuth } from "@clerk/express";
import { ensureLocalUser } from "../lib/users";
import type { NextFunction, Request, Response } from "express";

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!userId || !isAuthenticated) {
      res.status(401).json({ error: "Unauthorized!" });
      return;
    }

    const user = await ensureLocalUser(userId);
    if (!user) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
