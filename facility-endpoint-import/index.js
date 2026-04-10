'use strict';

const { parseCsvFile } = require('./lib/csv');
const { ApiClient } = require('./lib/api-client');
const { buildImportPlan } = require('./lib/importer');

const HELP_TEXT = `
Usage:
  node facility-endpoint-import/index.js --csv <path> --base-url <url> --username <user> --password <pass> [--dry-run]

Options:
  --csv         Absolute or relative path to the CSV file
  --base-url    Base API URL. Default: MHFR_API_BASE_URL or http://localhost:3000/api
  --username    API username. Default: MHFR_USERNAME
  --password    API password. Default: MHFR_PASSWORD
  --dry-run     Validate only. Do not insert data
  --help, -h    Show this help text
`.trim();

function parseArgs(argv) {
  const options = {
    csv: '',
    baseUrl: process.env.MHFR_API_BASE_URL || 'http://localhost:3000/api',
    username: process.env.MHFR_USERNAME || '',
    password: process.env.MHFR_PASSWORD || '',
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    const nextValue = argv[index + 1];
    if (typeof nextValue === 'undefined') {
      throw new Error(`Missing value for ${arg}`);
    }

    if (arg === '--csv') {
      options.csv = nextValue;
      index += 1;
      continue;
    }

    if (arg === '--base-url') {
      options.baseUrl = nextValue;
      index += 1;
      continue;
    }

    if (arg === '--username') {
      options.username = nextValue;
      index += 1;
      continue;
    }

    if (arg === '--password') {
      options.password = nextValue;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printIssues(title, issues) {
  if (!issues.length) {
    return;
  }

  console.log('');
  console.log(title);

  issues.slice(0, 50).forEach((issue) => {
    const rowText = issue.rowNumber ? `row ${issue.rowNumber}` : 'global';
    const facilityText = issue.facilityName ? ` [${issue.facilityName}]` : '';
    console.log(`- ${rowText}${facilityText}: ${issue.message}`);
  });

  if (issues.length > 50) {
    console.log(`- ... ${issues.length - 50} more`);
  }
}

async function main() {
  const argv = parseArgs(process.argv.slice(2));

  if (argv.help) {
    console.log(HELP_TEXT);
    return;
  }

  if (!argv.csv || !argv.username || !argv.password) {
    throw new Error(`Missing required arguments\n\n${HELP_TEXT}`);
  }

  console.log(`Reading CSV: ${argv.csv}`);
  const csvData = await parseCsvFile(argv.csv);
  console.log(`Parsed ${csvData.rows.length} data row(s)`);

  const apiClient = new ApiClient(argv.baseUrl);

  console.log('Authenticating...');
  const auth = await apiClient.login(argv.username, argv.password);

  console.log('Loading API reference data...');
  const [dependencies, existingFacilities] = await Promise.all([
    apiClient.loadDependencies(auth.id),
    apiClient.loadExistingFacilities(auth.id),
  ]);

  console.log('Validating dataset...');
  const plan = buildImportPlan({
    csvData,
    dependencies,
    existingFacilities,
  });

  console.log('');
  console.log('Validation summary');
  console.log(`- Total CSV rows: ${plan.totalRows}`);
  console.log(`- Candidate rows: ${plan.candidateRows}`);
  console.log(`- Skipped rows: ${plan.skipped.length}`);
  console.log(`- Valid rows: ${plan.records.length}`);
  console.log(`- Errors: ${plan.errors.length}`);
  console.log(`- Warnings: ${plan.warnings.length}`);

  printIssues('Validation errors', plan.errors);
  printIssues('Validation warnings', plan.warnings);

  if (plan.errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (argv.dryRun) {
    console.log('');
    console.log('Dry run complete. No facility was inserted.');
    return;
  }

  console.log('');
  console.log('Validation passed. Starting inserts...');

  let completed = 0;
  for (const record of plan.records) {
    completed += 1;
    console.log(
      `[${completed}/${plan.records.length}] Creating ${record.basic.facility_name}`
    );

    const createdFacility = await apiClient.createFacilityBundle(record, auth.id);

    console.log(
      `  Created facility #${createdFacility.id}: ${createdFacility.facility_name}`
    );
  }

  console.log('');
  console.log(`Import complete. Created ${completed} facility/facilities.`);
}

main().catch((error) => {
  console.error('');
  console.error('Importer failed');
  console.error(error && error.message ? error.message : error);

  if (error && error.response) {
    console.error(JSON.stringify(error.response, null, 2));
  }

  process.exitCode = 1;
});
