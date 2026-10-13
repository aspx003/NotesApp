import { eq, or } from "drizzle-orm";
import { db } from "../../repository/sqlite/db";
import { users } from "../../repository/sqlite/schema";
import bcrypt from "bcryptjs";
import { NewUserType } from "./usersDTO";

export const addNewUser = async (user: NewUserType) => {
  try {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, user.email), eq(users.name, user.name)))
      .get();

    if (existingUser) {
      throw new Error("User already exists with this username or email");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, salt);

    const [newUser] = await db
      .insert(users)
      .values({
        email: user.email,
        name: user.name,
        passwordHash,
      })
      .returning({
        id: users.id,
      });

    return newUser;
  } catch (error) {}
};
