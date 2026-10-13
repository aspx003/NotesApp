import type { Request, Response } from "express";
import { NewUserDTO } from "./usersDTO";
import { addNewUser } from "./usersService";

export const createNewUser = async (req: Request, res: Response) => {
  try {
    const data = NewUserDTO.parse(req.body);
    const newUser = await addNewUser(data);
  } catch (error) {
    res.json({ message: "Internal Server Error" });
  }
};
