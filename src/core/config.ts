function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Chybí povinná env proměnná: ${name}`);
  }
  return value;
}

export const config = {
  databaseUrl: process.env.DATABASE_URL ?? 'memory://local',
  greetingPrefix: process.env.GREETING_PREFIX ?? 'Ahoj',
} as const;

export { required };
