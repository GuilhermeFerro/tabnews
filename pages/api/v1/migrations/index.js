import { TRACE_OUTPUT_VERSION } from 'next/dist/shared/lib/constants';
import migrationRunner from 'node-pg-migrate'
import { join } from 'node:path'
import database from "infra/database.js"

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  }

  if (request.method === 'GET') {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

if (request.method === 'POST') {
  const migratiedMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dryRun: false,
  });

  await dbClient.end();

  if (migratiedMigrations.length > 0 ) {
    return response.status(201).json(migratiedMigrations);
  }
  return response.status(200).json(migratiedMigrations);
}

return response.status(405).end();
}
