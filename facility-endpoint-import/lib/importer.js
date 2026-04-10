'use strict';

const {
  RESOURCE_COLUMNS,
  SERVICE_PREFIXES,
  UTILITY_PREFIXES,
  SERVICE_ALIAS_MAP,
  UTILITY_ALIAS_MAP,
  WARNING_ONLY_COLUMNS,
  normalizeText,
  isSelected,
  parseLeafLabel,
  buildCandidates,
} = require('./mappings');

const COLUMNS = {
  facilityName: 'facility_name',
  commonName: 'common_name',
  registrationNumber: 'registration_number',
  districtId: 'district_id',
  facilityTypeId: 'facility_type_id',
  facilityOwnerId: 'facility_owner_id',
  operationalStatusId: 'facility_operational_status_id',
  regulatoryStatusId: 'facility_regulatory_status_id',
  openedDate: 'facility_date_opened',
  postalAddress: 'postalAddress',
  facilityPhone: 'Facility Phone #:',
  facilityEmail: 'Facility Email Address',
  contactName: 'contactName',
  duplicateContactPhone: 'contactEmail',
  duplicateContactEmail: 'contactEmail__2',
  facilityLocation: 'Facility Location',
  coordinates: 'Place your Phone/tablet to capture the Facility coordinates,',
  latitude: 'latitude',
  longitude: 'longitude',
  catchmentPopulation: 'catchmentPopulation',
  availability: 'Is this facility already available in MHFR?',
};

function cleanString(value) {
  return String(value || '').trim();
}

function isBlankRow(row) {
  return !Object.keys(row)
    .filter((key) => key.indexOf('__') !== 0)
    .some((key) => cleanString(row[key]));
}

function parsePositiveInteger(value) {
  const normalized = cleanString(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parseDateOrDefault(value) {
  const normalized = cleanString(value);
  if (!normalized) {
    return {
      value: '1975-01-01',
      usedDefault: true,
    };
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return {
      value: '1975-01-01',
      usedDefault: true,
    };
  }

  return {
    value: parsed.toISOString(),
    usedDefault: false,
  };
}

function parseFloatSafe(value) {
  const normalized = cleanString(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function parseCoordinatesFromCombined(value) {
  const normalized = cleanString(value);
  if (!normalized) {
    return {};
  }

  const parts = normalized.split(/\s+/).map(Number).filter((part) => !Number.isNaN(part));
  if (parts.length < 2) {
    return {};
  }

  return {
    latitude: parts[0],
    longitude: parts[1],
  };
}

function normalizePhone(value) {
  const normalized = cleanString(value);
  if (!normalized) {
    return '';
  }

  const candidates = normalized.split(/[\/;,]/);
  for (const candidate of candidates) {
    const digits = candidate.replace(/\D/g, '');
    if (!digits) {
      continue;
    }

    if (digits.length === 9) {
      return `0${digits}`;
    }

    if (digits.length === 10 && digits.indexOf('0') === 0) {
      return digits;
    }

    if (digits.length === 12 && digits.indexOf('265') === 0) {
      return `0${digits.slice(3)}`;
    }

    return digits;
  }

  return '';
}

function pickBestEmail(row) {
  const candidates = [
    cleanString(row[COLUMNS.duplicateContactEmail]),
    cleanString(row[COLUMNS.facilityEmail]),
    cleanString(row[COLUMNS.duplicateContactPhone]),
  ];

  for (const candidate of candidates) {
    if (candidate && isValidEmail(candidate)) {
      return candidate;
    }
  }

  return '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanString(value));
}

function buildLookupById(items) {
  const map = new Map();
  items.forEach((item) => {
    map.set(item.id, item);
  });
  return map;
}

function buildLookupByName(items, fieldName) {
  const map = new Map();

  items.forEach((item) => {
    const key = normalizeText(item[fieldName]);
    const existing = map.get(key) || [];
    existing.push(item);
    map.set(key, existing);
  });

  return map;
}

function resolveByCandidates(lookup, candidates) {
  for (const candidate of candidates) {
    const matches = lookup.get(normalizeText(candidate)) || [];
    if (matches.length === 1) {
      return { entity: matches[0] };
    }

    if (matches.length > 1) {
      return {
        error: `Ambiguous match for "${candidate}"`,
      };
    }
  }

  return {
    error: `No match for any of: ${candidates.join(', ')}`,
  };
}

function expandServiceIds(serviceIds, servicesById) {
  const expanded = new Set(serviceIds);
  const queue = serviceIds.slice();

  while (queue.length > 0) {
    const currentId = queue.pop();
    const service = servicesById.get(currentId);

    if (
      service &&
      service.service_category_id &&
      !expanded.has(service.service_category_id)
    ) {
      expanded.add(service.service_category_id);
      queue.push(service.service_category_id);
    }
  }

  return Array.from(expanded);
}

function buildLookups(dependencies) {
  return {
    districtsById: buildLookupById(dependencies.districts),
    facilityTypesById: buildLookupById(dependencies.facilityTypes),
    ownersById: buildLookupById(dependencies.owners),
    operationalStatusesById: buildLookupById(dependencies.operationalStatuses),
    regulatoryStatusesById: buildLookupById(dependencies.regulatoryStatuses),
    resourcesByName: buildLookupByName(dependencies.resources, 'resource_name'),
    utilitiesByName: buildLookupByName(dependencies.utilities, 'utility_name'),
    servicesByName: buildLookupByName(dependencies.services, 'service_name'),
    servicesById: buildLookupById(dependencies.services),
  };
}

function buildExistingFacilityIndex(existingFacilities) {
  const byNameAndDistrict = new Set();
  const byRegistrationNumber = new Set();

  existingFacilities.forEach((facility) => {
    const name = cleanString(facility.facility_name);
    const districtId = facility.district_id;
    const registrationNumber = cleanString(facility.registration_number);

    if (name && districtId) {
      byNameAndDistrict.add(`${normalizeText(name)}::${districtId}`);
    }

    if (registrationNumber) {
      byRegistrationNumber.add(normalizeText(registrationNumber));
    }
  });

  return {
    byNameAndDistrict,
    byRegistrationNumber,
  };
}

function collectWarningOnlyFields(row, warnings, facilityName) {
  WARNING_ONLY_COLUMNS.forEach((column) => {
    if (cleanString(row[column])) {
      warnings.push({
        rowNumber: row.__rowNumber,
        facilityName,
        message: `Column "${column}" has data and will be ignored by the importer`,
      });
    }
  });
}

function validateReference(id, lookup, label, row, facilityName, errors) {
  if (!id) {
    errors.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: `${label} is required`,
    });
    return null;
  }

  const found = lookup.get(id);
  if (!found) {
    errors.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: `${label} ${id} does not exist in the target API`,
    });
    return null;
  }

  return found;
}

function buildResourcePayloads(row, lookups, errors, facilityName) {
  const payloads = [];

  RESOURCE_COLUMNS.forEach((definition) => {
    const rawValue = cleanString(row[definition.column]);
    if (!rawValue) {
      return;
    }

    const quantity = Number(rawValue);
    if (Number.isNaN(quantity)) {
      errors.push({
        rowNumber: row.__rowNumber,
        facilityName,
        message: `Resource column "${definition.column}" must be numeric`,
      });
      return;
    }

    if (quantity <= 0) {
      return;
    }

    const resolved = resolveByCandidates(lookups.resourcesByName, definition.candidates);
    if (!resolved.entity) {
      errors.push({
        rowNumber: row.__rowNumber,
        facilityName,
        message: `Resource mapping failed for "${definition.column}": ${resolved.error}`,
      });
      return;
    }

    payloads.push({
      client_id: 1,
      resource_id: resolved.entity.id,
      quantity,
      description: definition.column,
      created_date: new Date().toISOString(),
    });
  });

  return payloads;
}

function buildUtilityPayloads(row, headers, lookups, errors, warnings, facilityName) {
  const utilityIds = new Set();

  headers.forEach((header) => {
    const leaf = parseLeafLabel(header, UTILITY_PREFIXES);
    if (!leaf || normalizeText(leaf) === 'other') {
      return;
    }

    if (!isSelected(row[header])) {
      return;
    }

    const candidates = buildCandidates(leaf, UTILITY_ALIAS_MAP);
    const resolved = resolveByCandidates(lookups.utilitiesByName, candidates);

    if (!resolved.entity) {
      errors.push({
        rowNumber: row.__rowNumber,
        facilityName,
        message: `Utility mapping failed for "${header}": ${resolved.error}`,
      });
      return;
    }

    utilityIds.add(resolved.entity.id);
  });

  if (isSelected(row['Source of Energy (Electricity):/Other'])) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Selected energy "Other" is not imported automatically',
    });
  }

  if (isSelected(row['Waste Disposal:/Other'])) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Selected waste-disposal "Other" is not imported automatically',
    });
  }

  if (isSelected(row['Source of Water/Other']) || isSelected(row['Source of Water:/Other'])) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Selected water-source "Other" is not imported automatically',
    });
  }

  return Array.from(utilityIds).map((utilityId) => ({
    utility_id: utilityId,
    client_id: 1,
    created_date: new Date().toISOString(),
  }));
}

function buildServicePayloads(row, headers, lookups, errors, warnings, facilityName) {
  const selectedServiceIds = new Set();

  headers.forEach((header) => {
    const leaf = parseLeafLabel(header, SERVICE_PREFIXES);
    if (!leaf || normalizeText(leaf) === 'other') {
      return;
    }

    if (!isSelected(row[header])) {
      return;
    }

    const candidates = buildCandidates(leaf, SERVICE_ALIAS_MAP);
    const resolved = resolveByCandidates(lookups.servicesByName, candidates);

    if (!resolved.entity) {
      errors.push({
        rowNumber: row.__rowNumber,
        facilityName,
        message: `Service mapping failed for "${header}": ${resolved.error}`,
      });
      return;
    }

    selectedServiceIds.add(resolved.entity.id);
  });

  [
    'Services Offered : Outpatient Services (OPD)/Other',
    'Services Offered: Laboratory/Other',
    'Services Offered: Radiology Services/Other',
    'Services Offered: In-Patient Services (IPD)/Other',
    'Services Offered: Community Health Services/Other',
    'Services Offered: Other Specialized Services/Other',
  ].forEach((column) => {
    if (isSelected(row[column])) {
      warnings.push({
        rowNumber: row.__rowNumber,
        facilityName,
        message: `Selected service "Other" in "${column}" is not imported automatically`,
      });
    }
  });

  const expandedServiceIds = expandServiceIds(
    Array.from(selectedServiceIds),
    lookups.servicesById
  );

  return expandedServiceIds.map((serviceId) => ({
    service_id: serviceId,
    client_id: 1,
    created_date: new Date().toISOString(),
  }));
}

function buildCandidateRecord(row, headers, lookups, existingIndex, localSeen) {
  const errors = [];
  const warnings = [];

  const facilityName = cleanString(row[COLUMNS.facilityName]);
  if (!facilityName) {
    errors.push({
      rowNumber: row.__rowNumber,
      message: 'facility_name is required',
    });
    return { errors, warnings };
  }

  collectWarningOnlyFields(row, warnings, facilityName);

  const districtId = parsePositiveInteger(row[COLUMNS.districtId]);
  const facilityTypeId = parsePositiveInteger(row[COLUMNS.facilityTypeId]);
  const facilityOwnerId = parsePositiveInteger(row[COLUMNS.facilityOwnerId]);
  const operationalStatusId = parsePositiveInteger(row[COLUMNS.operationalStatusId]);
  const regulatoryStatusId = parsePositiveInteger(row[COLUMNS.regulatoryStatusId]);

  validateReference(
    districtId,
    lookups.districtsById,
    'district_id',
    row,
    facilityName,
    errors
  );
  validateReference(
    facilityTypeId,
    lookups.facilityTypesById,
    'facility_type_id',
    row,
    facilityName,
    errors
  );
  validateReference(
    facilityOwnerId,
    lookups.ownersById,
    'facility_owner_id',
    row,
    facilityName,
    errors
  );
  validateReference(
    operationalStatusId,
    lookups.operationalStatusesById,
    'facility_operational_status_id',
    row,
    facilityName,
    errors
  );
  validateReference(
    regulatoryStatusId,
    lookups.regulatoryStatusesById,
    'facility_regulatory_status_id',
    row,
    facilityName,
    errors
  );

  const registrationNumber = cleanString(row[COLUMNS.registrationNumber]);
  const facilityKey = `${normalizeText(facilityName)}::${districtId || ''}`;

  if (districtId && existingIndex.byNameAndDistrict.has(facilityKey)) {
    errors.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Facility already exists in the target API for the same district',
    });
  }

  if (registrationNumber && existingIndex.byRegistrationNumber.has(normalizeText(registrationNumber))) {
    errors.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: `registration_number "${registrationNumber}" already exists in the target API`,
    });
  }

  if (localSeen.facilityKeys.has(facilityKey)) {
    errors.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Duplicate facility_name + district_id found inside the CSV',
    });
  } else if (districtId) {
    localSeen.facilityKeys.add(facilityKey);
  }

  if (registrationNumber) {
    const registrationKey = normalizeText(registrationNumber);
    if (localSeen.registrationNumbers.has(registrationKey)) {
      errors.push({
        rowNumber: row.__rowNumber,
        facilityName,
        message: `Duplicate registration_number "${registrationNumber}" found inside the CSV`,
      });
    } else {
      localSeen.registrationNumbers.add(registrationKey);
    }
  }

  const commonName = cleanString(row[COLUMNS.commonName]) || facilityName;
  const openedDate = parseDateOrDefault(row[COLUMNS.openedDate]);
  if (openedDate.usedDefault) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'facility_date_opened was blank or invalid, defaulted to 1975-01-01',
    });
  }

  const contactName = cleanString(row[COLUMNS.contactName]) || facilityName;
  if (!cleanString(row[COLUMNS.contactName])) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'contactName was blank, defaulted to facility_name',
    });
  }

  const contactPhone = normalizePhone(
    row[COLUMNS.duplicateContactPhone] ||
      row[COLUMNS.facilityPhone] ||
      row[COLUMNS.duplicateContactEmail]
  );
  if (!contactPhone || contactPhone.length < 8) {
    errors.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'No usable contact phone number found',
    });
  }

  const contactEmail = pickBestEmail(row);
  if (!contactEmail && cleanString(row[COLUMNS.facilityEmail])) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Facility email was present but invalid and has been dropped',
    });
  }

  const postalAddress = cleanString(row[COLUMNS.postalAddress]);
  const physicalAddress = postalAddress || facilityName;
  if (!postalAddress) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'postalAddress was blank, physical address defaulted to facility_name',
    });
  }

  const catchmentArea = cleanString(row[COLUMNS.facilityLocation]) || 'Unknown';
  if (catchmentArea === 'Unknown') {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Facility Location was blank, catchment area defaulted to "Unknown"',
    });
  }

  const catchmentPopulation = parsePositiveInteger(row[COLUMNS.catchmentPopulation]);
  const normalizedCatchmentPopulation =
    catchmentPopulation === null ? 0 : catchmentPopulation;

  if (catchmentPopulation === null) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'catchmentPopulation was blank or invalid, defaulted to 0',
    });
  }

  const combinedCoordinates = parseCoordinatesFromCombined(row[COLUMNS.coordinates]);
  const latitude =
    parseFloatSafe(row[COLUMNS.latitude]) !== null
      ? parseFloatSafe(row[COLUMNS.latitude])
      : combinedCoordinates.latitude;
  const longitude =
    parseFloatSafe(row[COLUMNS.longitude]) !== null
      ? parseFloatSafe(row[COLUMNS.longitude])
      : combinedCoordinates.longitude;

  if (latitude === null || longitude === null) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Coordinates were missing or invalid and will be sent blank',
    });
  }

  if (latitude !== null && latitude > 0) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Latitude is positive; verify the source data is correct for Malawi',
    });
  }

  if (longitude !== null && longitude < 0) {
    warnings.push({
      rowNumber: row.__rowNumber,
      facilityName,
      message: 'Longitude is negative; verify the source data is correct for Malawi',
    });
  }

  const basic = {
    facility_name: facilityName,
    common_name: commonName,
    facility_date_opened: openedDate.value,
    facility_owner_id: facilityOwnerId,
    facility_operational_status_id: operationalStatusId,
    district_id: districtId,
    facility_code_mapping: [],
    client_id: 1,
    updated_at: Date.now(),
    facility_type_id: facilityTypeId,
    facility_regulatory_status_id: regulatoryStatusId,
  };

  if (registrationNumber) {
    basic.registration_number = registrationNumber;
  }

  const contact = {
    physicalAddress,
    postalAddress: postalAddress || '',
    contactName,
    contactPhoneNumber: contactPhone,
    contactEmail,
    catchmentArea,
    catchmentPopulation: normalizedCatchmentPopulation,
    longitude: longitude === null ? '' : String(longitude),
    latitude: latitude === null ? '' : String(latitude),
    client: 1,
    updated_at: Date.now(),
  };

  const resources = buildResourcePayloads(
    row,
    lookups,
    errors,
    facilityName
  );
  const utilities = buildUtilityPayloads(
    row,
    headers,
    lookups,
    errors,
    warnings,
    facilityName
  );
  const services = buildServicePayloads(
    row,
    headers,
    lookups,
    errors,
    warnings,
    facilityName
  );

  if (errors.length > 0) {
    return { errors, warnings };
  }

  return {
    errors,
    warnings,
    record: {
      rowNumber: row.__rowNumber,
      basic,
      contact,
      resources,
      utilities,
      services,
    },
  };
}

function shouldSkipByAvailability(row) {
  const availability = normalizeText(row[COLUMNS.availability]);
  return availability === 'yes';
}

function buildImportPlan(args) {
  const csvData = args.csvData;
  const dependencies = args.dependencies;
  const existingFacilities = args.existingFacilities;
  const headers = csvData.headers;
  const lookups = buildLookups(dependencies);
  const existingIndex = buildExistingFacilityIndex(existingFacilities);
  const localSeen = {
    facilityKeys: new Set(),
    registrationNumbers: new Set(),
  };

  const plan = {
    totalRows: csvData.rows.length,
    candidateRows: 0,
    skipped: [],
    warnings: [],
    errors: [],
    records: [],
  };

  csvData.rows.forEach((row) => {
    if (isBlankRow(row)) {
      plan.skipped.push({
        rowNumber: row.__rowNumber,
        reason: 'blank row',
      });
      return;
    }

    if (shouldSkipByAvailability(row)) {
      plan.skipped.push({
        rowNumber: row.__rowNumber,
        reason: 'already marked as available in MHFR',
      });
      return;
    }

    plan.candidateRows += 1;

    const result = buildCandidateRecord(
      row,
      headers,
      lookups,
      existingIndex,
      localSeen
    );

    plan.warnings = plan.warnings.concat(result.warnings || []);
    plan.errors = plan.errors.concat(result.errors || []);

    if (!result.record) {
      return;
    }

    plan.records.push(result.record);
  });

  return {
    totalRows: plan.totalRows,
    candidateRows: plan.candidateRows,
    skipped: plan.skipped,
    warnings: plan.warnings,
    errors: plan.errors,
    records: plan.records.map((record) => ({
      rowNumber: record.rowNumber,
      basic: record.basic,
      contact: record.contact,
      resources: record.resources.map((payload) => Object.assign({}, payload)),
      utilities: record.utilities.map((payload) => Object.assign({}, payload)),
      services: record.services.map((payload) => Object.assign({}, payload)),
    })),
  };
}

module.exports = {
  buildImportPlan,
};
