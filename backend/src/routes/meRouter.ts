// import { getAuth } from "@clerk/express";
import { Router } from "express";
// import { getLocalUser } from "../lib/users";
import { getMe } from "../controllers/meControllers";

const router = Router();

router.get("/", getMe);

// router.get("/", async (req, res, next) => {
//   try {
//     const { userId, isAuthenticated } = getAuth(req);
//     if (!userId || !isAuthenticated) {
//       res.status(401).json({ error: "Unauthorized!" });
//       return;
//     }

//     const user = await getLocalUser(userId);
//     res.json(user);
//   } catch (error) {
//     next(error);
//   }
// });

export default router;
