import z from 'zod';

const schema = z.object({
    PORT: z.number().default(3000),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
});
export type Config = z.infer<typeof schema>;
export default () =>
    schema.parse({
        PORT: parseInt(process.env.PORT, 10),
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
    });
