import { Router } from "express";

import * as adminService from "../services/admin.service";
import {
  isStudyManager,
  isSuperAdmin,
  isUserManager,
} from "../middleware/auth";
import { route } from "../util/handlers";

const router = Router();

router.post(
  "/users/:id",
  isSuperAdmin,
  route((req) => adminService.updateRole(req.params.id, req.body.role))
);

router.post(
  "/battery",
  isStudyManager,
  route((req) => adminService.createBattery(req.body))
);

router.put(
  "/battery/:id",
  isStudyManager,
  route((req) => adminService.editBattery(req.body, req.params.id))
);

router.delete(
  "/battery/:id",
  isStudyManager,
  route((req) => adminService.deleteBattery(req.params.id))
);

router.get(
  "/users",
  isUserManager,
  route(() => adminService.getAdminUsers())
);

router.delete(
  "/users/:id",
  isSuperAdmin,
  route((req) => adminService.removeUserAsAdmin(req.params.id))
);

export default router;
