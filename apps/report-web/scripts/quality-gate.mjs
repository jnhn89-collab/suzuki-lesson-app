import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const appRoot = process.cwd();
const repoRoot = join(appRoot, "..", "..");

const checks = [
  {
    name: "research personas cover at least 20 teachers and 20 parents",
    run() {
      const teachers = readJson(join(repoRoot, "data/research/personas.teacher.json"));
      const parents = readJson(join(repoRoot, "data/research/personas.parent.json"));
      assert(Array.isArray(teachers) && teachers.length >= 20, "teacher personas < 20");
      assert(Array.isArray(parents) && parents.length >= 20, "parent personas < 20");
    },
  },
  {
    name: "source log and use cases are present",
    run() {
      const sources = readJson(join(repoRoot, "data/research/source-log.json"));
      const useCases = readJson(join(repoRoot, "data/research/use-cases.json"));
      assert(Array.isArray(sources) && sources.length >= 8, "source log < 8");
      assert(Array.isArray(useCases) && useCases.length >= 6, "use cases < 6");
    },
  },
  {
    name: "core planning docs exist",
    run() {
      for (const file of ["docs/FACTBOOK.md", "docs/DEV_CYCLES.md", "docs/PROCESS_LOG.md"]) {
        assert(existsSync(join(repoRoot, file)), `${file} missing`);
      }
    },
  },
  {
    name: "legacy /r parent route is removed",
    run() {
      for (const file of [
        "src/app/r/[token]/page.tsx",
        "src/app/r/[token]/verify/route.ts",
        "src/app/r/[token]/view/page.tsx",
      ]) {
        assert(!existsSync(join(appRoot, file)), `${file} still exists`);
      }
    },
  },
  {
    name: "portal token does not parse DB UUIDs",
    run() {
      const security = readFileSync(join(appRoot, "src/lib/security.ts"), "utf8");
      assert(!security.includes("parsePortalLinkToken"), "parsePortalLinkToken still present");
      assert(!security.includes("UUID_PATTERN"), "UUID_PATTERN still present");
    },
  },
  {
    name: "parent portal hardening migration exists",
    run() {
      const migration = join(appRoot, "supabase/migrations/0004_parent_portal_security.sql");
      assert(existsSync(migration), "0004 parent portal security migration missing");
    },
  },
];

const failures = [];

for (const check of checks) {
  try {
    check.run();
    console.log(`ok - ${check.name}`);
  } catch (error) {
    failures.push(`${check.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error("\nQuality gate failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
