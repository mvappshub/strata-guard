export const config = {
  databaseUrl: process.env.DATABASE_URL ?? 'memory://local',
  greetingPrefix: process.env.GREETING_PREFIX ?? 'Ahoj',
} as const;
