import { Router } from "express";

import { isAdmin, isAuthenticated } from "../middleware/auth";
import { authRoute, route } from "../util/handlers";
import * as tasksService from "../services/tasks.service";

const router = Router();

router.get(
  "/",
  isAuthenticated,
  route(() => tasksService.getTaskLibrary())
);

router.get(
  "/custom/:id",
  isAuthenticated,
  authRoute((req, user) => tasksService.getCustomizedTask(user, req.params.id))
);

router.delete(
  "/:id",
  isAdmin,
  route((req) => tasksService.deleteTask(req.params.id))
);

export default router;
