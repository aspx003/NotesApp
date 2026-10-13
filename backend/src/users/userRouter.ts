import { Router } from "express";
import { createNewUser } from "./usersRepository";

const router = Router();

router.post("/", createNewUser);

export default router;
