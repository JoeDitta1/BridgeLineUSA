import { z } from 'zod';

const quoteBomSchema = z.object({
  material: z.string().nonempty(),
  size: z.string().nonempty(),
  grade: z.string().nonempty(),
  thickness_or_wall: z.string().nonempty(),
  length: z.number().positive(),
  qty: z.number().int().positive(),
  unit: z.string().nonempty(),
  notes: z.string().optional(),
});

const validateQuoteBom = (data) => {
  return quoteBomSchema.safeParse(data);
};

export { validateQuoteBom };