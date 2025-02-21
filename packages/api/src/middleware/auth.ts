import HttpError from "../types/errors";

import type { RequestHandler } from "express";
import { Role, type IUser } from "@seitz/shared";

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  next(new HttpError(401, "Unauthorized"));
};

export const isSuperAdmin: RequestHandler = (req, res, next) => {
  const user = req.user as IUser | undefined;
  const userRole = user?.role;
  if (userRole === Role.SuperAdmin) {
    return next();
  }

  next(new HttpError(403, "Admin access only"));
};

export const isUserManager: RequestHandler = (req, res, next) => {
  const user = req.user as IUser | undefined;
  const userRole = user?.role;
  if (userRole === Role.SuperAdmin || userRole === Role.UserManager) {
    return next();
  }

  next(new HttpError(403, "Admin access only"));
};

export const isStudyManager: RequestHandler = (req, res, next) => {
  const user = req.user as IUser | undefined;
  const userRole = user?.role;
  if (userRole === Role.SuperAdmin || userRole === Role.StudyManager) {
    return next();
  }

  next(new HttpError(403, "Admin access only"));
};
