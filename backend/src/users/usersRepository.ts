import type { Request, Response } from "express";
import { NewUserDTO } from "./usersDTO";
import { addNewUser } from "./usersService";

export const createNewUser = async (req: Request, res: Response) => {
  try {
    const data = NewUserDTO.parse(req.body);
    const newUser = await addNewUser(data);

    res.json({ message: `User with id: ${newUser?.id} created successfully` });
  } catch (error) {
    res.json({ message: "Internal Server Error" });
  }
};
