import * as z from "zod";

export const NewUserDTO = z.object({
  name: z.string().min(5).nonempty(),
  email: z.email(),
  password: z.string().min(5),
});

export type NewUserType = z.infer<typeof NewUserDTO>;
