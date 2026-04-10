'use strict';

const fs = require('fs');
const path = require('path');

function parseCsv(content) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;
  let normalizedContent = content;

  if (normalizedContent.charCodeAt(0) === 0xfeff) {
    normalizedContent = normalizedContent.slice(1);
  }

  for (let index = 0; index < normalizedContent.length; index += 1) {
    const character = normalizedContent[index];
    const nextCharacter = normalizedContent[index + 1];

    if (inQuotes) {
      if (character === '"' && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      if (character === '"') {
        inQuotes = false;
        continue;
      }

      currentCell += character;
      continue;
    }

    if (character === '"') {
      inQuotes = true;
      continue;
    }

    if (character === ',') {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if (character === '\r') {
      if (nextCharacter === '\n') {
        index += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      continue;
    }

    if (character === '\n') {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += character;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows;
}

function makeUniqueHeaders(headers) {
  const seen = {};

  return headers.map((header, index) => {
    const baseHeader = String(header || '').trim() || `__empty_${index + 1}`;
    const count = seen[baseHeader] || 0;
    seen[baseHeader] = count + 1;

    return count === 0 ? baseHeader : `${baseHeader}__${count + 1}`;
  });
}

async function parseCsvFile(filePath) {
  const resolvedPath = path.resolve(filePath);
  const content = await fs.promises.readFile(resolvedPath, 'utf8');
  const records = parseCsv(content);

  if (!records.length) {
    return {
      filePath: resolvedPath,
      headers: [],
      rows: [],
    };
  }

  const headers = makeUniqueHeaders(records[0]);
  const rows = records.slice(1).map((rawRow, index) => {
    const row = {
      __rowNumber: index + 2,
      __raw: rawRow,
    };

    headers.forEach((header, headerIndex) => {
      row[header] = typeof rawRow[headerIndex] === 'undefined' ? '' : rawRow[headerIndex];
    });

    return row;
  });

  return {
    filePath: resolvedPath,
    headers,
    rows,
  };
}

module.exports = {
  parseCsvFile,
};
