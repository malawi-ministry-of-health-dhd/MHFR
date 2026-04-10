'use strict';

const RESOURCE_COLUMNS = [
  {
    column: 'Number of Motor Vehicle Ambulances:',
    candidates: ['Motor Vehicle Ambulances'],
  },
  {
    column: 'Number of utility Vehicles/Cars',
    candidates: ['Vehicles/Cars'],
  },
  {
    column: 'Number of Motor Cycles',
    candidates: ['Motor cycles'],
  },
  {
    column: 'Number Motor Bike Ambulances',
    candidates: ['Motor Bike Ambulances'],
  },
  {
    column: 'Number of Bicycles',
    candidates: ['Bicycles'],
  },
  {
    column: 'Number of Maternity Beds',
    candidates: ['Maternity beds'],
  },
  {
    column: 'Number of designated Delivery Beds:',
    candidates: ['Delivery beds'],
  },
  {
    column: 'Number of Other Inpatient Beds:',
    candidates: ['Other inpatient beds'],
  },
];

const WARNING_ONLY_COLUMNS = [
  'Other Transportation specify type and number',
  'Specify other facility energy sources',
  'Specify other Mobile Networks',
  'Specify other internet service providers',
  'Specify other Sources of Water',
  'Specify other Waste Disposal',
  'Specify other Outpatient Services',
  'Specify other Laboratory Services',
  'Specify other Radiology Services',
  'Specify other Inpatient Services',
  'Specify other Community Health Services',
  'Specify other Specialized Services Offered at the Facility',
];

const SERVICE_PREFIXES = [
  'Services Offered : Outpatient Services (OPD)/',
  'Services Offered: Laboratory/',
  'Services Offered: Radiology Services/',
  'Services Offered: In-Patient Services (IPD)/',
  'Services Offered: Community Health Services/',
  'Services Offered: Other Specialized Services/',
];

const UTILITY_PREFIXES = [
  'Source of Energy (Electricity):/',
  'Mobile Networks Accessible in the Facility:/',
  'Health Facility Internet Service Providers:/',
  'Source of Water/',
  'Source of Water:/',
  'Waste Disposal:/',
];

const SERVICE_ALIAS_MAP = {
  'general opd': ['General OPD'],
  'accidents emergencies': ['Accidents & Emergencies'],
  'medical rehabilitation': ['Medical Rehabilitation'],
  'under 5': ['Under 5'],
  'ncd': ['NCD', 'Non-Communicable Diseases'],
  'family health': ['Family Health'],
  dental: ['Dental'],
  'ophthalmology eye': ['Ophthalmology (Eye)'],
  'dermatology skin': ['Dermatology (Skin)'],
  ent: ['ENT', 'Ear Nose and Throat (ENT)'],
  sti: ['STI', 'STI services'],
  hts: ['HTS', 'HIV Testing Services', 'HIV Testing'],
  art: ['ART', 'ART services'],
  'palliative care': ['Palliative care', 'Palliative care Services'],
  'non communicable disease ncd': ['NCD', 'Non-Communicable Diseases'],
  'ear nose and throat ent': ['ENT', 'Ear Nose and Throat (ENT)'],
  'sexual transmitted infections sti': ['STI', 'STI services'],
  'hiv testing services': ['HIV Testing Services', 'HIV Testing'],
  'antiviral therapy art': ['ART services', 'ART'],
  parasitology: ['Parasitology'],
  microbiology: ['Microbiology'],
  'clinical chemistry': ['Clinical Chemistry'],
  'immunology and serology': ['Immunology and Serology'],
  hematology: ['Hematology'],
  'blood transfusion': ['Blood Transfusion', ' Blood Transfusion'],
  'pathology histopathology': ['Pathology - Histopathology'],
  'pathology cytology': ['Pathology - Cytology'],
  'x ray': ['X-ray', 'X-Ray'],
  ultrasound: ['Ultrasound', 'USS'],
  'ct scan': ['CT-Scan', 'Tomography'],
  mri: ['MRI'],
  pediatric: ['Pediatric'],
  medical: ['Medical'],
  'surgical orthopedic': ['Surgical Orthopedic'],
  'surgical minor': ['Surgical Minor'],
  'surgical major': ['Surgical Major'],
  'obs gynae': ['Obs & Gynae'],
  maternity: ['Maternity'],
  neonatal: ['Neonatal'],
  'critical care icu': ['Critical care ICU'],
  'critical care hdu': ['Critical care HDU'],
  nutrition: ['Nutrition', 'Nutrition services'],
  'theatre minor': ['Theatre Minor'],
  'theatre major': ['Theatre Major'],
  'imci integrated management of child illnesses': [
    'IMCI – Integrated Management of Child Illnesses',
    'MCI-Integrated Mangement of child illiness',
  ],
  immunizations: ['Immunizations', 'Child immunisation'],
  'maternal child health': ['Maternal & Child Health'],
  'school health': ['School Health'],
  'health education': ['Health Education', 'Health education'],
  oncology: ['Oncology'],
  cardiology: ['Cardiology'],
  histology: ['Histology'],
  neurology: ['Neurology'],
  urology: ['Urology'],
  psychiatry: ['Psychiatry'],
};

const UTILITY_ALIAS_MAP = {
  'national grid': ['National Grid'],
  generator: ['Generator'],
  'solar panels': ['Solar panels'],
  'no electricity': ['No electricity'],
  airtel: ['Airtel'],
  tnm: ['TNM'],
  access: ['Access'],
  mtl: ['MTL'],
  gwan: ['GWAN'],
  skyband: ['Skyband'],
  globe: ['Globe'],
  'piped water into health facility': ['Piped into health facility'],
  'piped water into yard plot': ['Piped into facility ground'],
  'public tap or stand pipe': ['Public tap/stand pipe'],
  borehole: ['Tube well/borehole'],
  'protected dug well': ['Protected dug well'],
  'protected spring': ['protected spring'],
  'rainwater harvesting': ['Rainwater harvesting'],
  incinerator: ['Incinerator'],
  'placenta pit': ['Placenta pit'],
  'rubbish pit': ['Rubbish pit'],
  'pit latrine': ['Pit latrine'],
  'water closet': ['Toilet'],
  'ash pit': ['Ash pit'],
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[_/:-]+/g, ' ')
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSelected(value) {
  const normalized = normalizeText(value);
  return Boolean(
    normalized &&
      normalized !== '0' &&
      normalized !== 'no' &&
      normalized !== 'false' &&
      normalized !== 'n' &&
      normalized !== 'null'
  );
}

function parseLeafLabel(header, prefixes) {
  for (const prefix of prefixes) {
    if (header.indexOf(prefix) === 0) {
      return header.slice(prefix.length).trim();
    }
  }

  return null;
}

function buildCandidates(label, aliasMap) {
  const key = normalizeText(label);
  const aliases = aliasMap[key] || [];
  const candidates = [label].concat(aliases);

  return Array.from(new Set(candidates.filter(Boolean)));
}

module.exports = {
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
};
