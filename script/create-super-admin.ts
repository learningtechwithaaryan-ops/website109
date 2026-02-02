import { db } from "../server/db";
import { admins } from "../shared/models/auth";
import { hashPassword } from "../server/auth/utils";

(async () => {
  await db.insert(admins).values({
    email: "aaryabpandey@gmail.com",
    passwordHash: await hashPassword("pandeyaarya254"),
    isSuperAdmin: true,
  });

  console.log("✅ Super Admin created");
})();
