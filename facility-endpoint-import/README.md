# Facility Endpoint Importer

This folder contains a standalone CSV importer that creates facilities by calling the MHFR API endpoints, not by writing directly to the database.

The importer does two phases:

1. Parse and validate the full CSV file.
2. Only if validation succeeds for every candidate row, execute the create flow against the API.

## What It Calls

For each valid row, the importer calls the same backend endpoints used by the app flow:

- `POST /clients/login`
- `GET /Districts`
- `GET /FacilityTypes`
- `GET /Owners`
- `GET /OperationalStatuses`
- `GET /RegulatoryStatuses`
- `GET /Utilities`
- `GET /Resources`
- `GET /Services`
- `GET /Facilities`
- `POST /Facilities`
- `POST /Facilities/publish`
- `POST /Facilities/contactDetails`
- `POST /FacilityResources`
- `POST /FacilityUtilities`
- `POST /FacilityServices`

## Run

```bash
node facility-endpoint-import/index.js \
  --csv "/Users/louis/Downloads/MHFR ANAYZED.xlsx - Not Available in MHFR.csv" \
  --base-url "http://localhost:3000/api" \
  --username "adminuser" \
  --password "WHSki"
```

Validate only:

```bash
node facility-endpoint-import/index.js \
  --csv "/Users/louis/Downloads/MHFR ANAYZED.xlsx - Not Available in MHFR.csv" \
  --base-url "http://localhost:3000/api" \
  --username "adminuser" \
  --password "1234" \
  --dry-run
```

## Notes

- The script skips blank rows automatically.
- By default it skips rows where `Is this facility already available in MHFR?` is `Yes`.
- Validation checks the whole candidate dataset before inserts begin.
- Some free-text `Other` columns are reported as warnings and are not imported automatically.
- This script assumes the numeric reference IDs in the CSV match the target MHFR instance.
