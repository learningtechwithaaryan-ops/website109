import { Router } from "express";
import { db } from "../db";
import { admins } from "../../shared/models/auth";
import { hashPassword } from "../auth/utils";
import { requireSuperAdmin } from "../auth/middleware";

const router = Router();

/**
 * CREATE ADMIN
 * Only Super Admin can do this
 */
router.post("/", requireSuperAdmin, async (req, res) => {
  const { email, password } = req.body;

  const passwordHash = await hashPassword(password);

  const [admin] = await db
    .insert(admins)
    .values({
      email,
      passwordHash,
      isSuperAdmin: false,
    })
    .returning({
      id: admins.id,
      email: admins.email,
    });

  res.status(201).json(admin);
});

export default router;
