import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  // User must already be authenticated
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  // Only admins are allowed
  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Admin access required",
    });
    return;
  }

  next();
};