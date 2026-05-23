import { getAuth } from "@clerk/express";
import { getLocalUser } from "../lib/users";
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

    const user = await getLocalUser(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
