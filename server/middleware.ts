import { Request, Response, NextFunction } from "express";

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session?.admin?.isSuperAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}
