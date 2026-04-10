'use strict';

const http = require('http');
const https = require('https');

function joinUrl(baseUrl, pathname, query) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = new URL(pathname.replace(/^\//, ''), base);

  if (query) {
    Object.keys(query).forEach((key) => {
      if (typeof query[key] !== 'undefined' && query[key] !== null) {
        url.searchParams.set(key, query[key]);
      }
    });
  }

  return url;
}

function requestJson(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    const payload =
      typeof body === 'undefined' || body === null ? null : JSON.stringify(body);

    const headers = {
      Accept: 'application/json',
    };

    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    if (token) {
      headers.Authorization = token;
    }

    const req = transport.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed = data;

          if (data) {
            try {
              parsed = JSON.parse(data);
            } catch (error) {
              parsed = data;
            }
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
            return;
          }

          const error = new Error(
            `${method} ${url.toString()} failed with status ${res.statusCode}`
          );
          error.statusCode = res.statusCode;
          error.response = parsed;
          reject(error);
        });
      }
    );

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async login(username, password) {
    const url = joinUrl(this.baseUrl, '/clients/login');
    return requestJson('POST', url, { username, password });
  }

  async get(pathname, token, query) {
    const url = joinUrl(this.baseUrl, pathname, query);
    return requestJson('GET', url, null, token);
  }

  async post(pathname, body, token) {
    const url = joinUrl(this.baseUrl, pathname);
    return requestJson('POST', url, body, token);
  }

  async loadDependencies(token) {
    const [
      districts,
      facilityTypes,
      owners,
      operationalStatuses,
      regulatoryStatuses,
      utilities,
      resources,
      services,
    ] = await Promise.all([
      this.get('/Districts', token),
      this.get('/FacilityTypes', token),
      this.get('/Owners', token),
      this.get('/OperationalStatuses', token),
      this.get('/RegulatoryStatuses', token),
      this.get('/Utilities', token),
      this.get('/Resources', token),
      this.get('/Services', token),
    ]);

    return {
      districts,
      facilityTypes,
      owners,
      operationalStatuses,
      regulatoryStatuses,
      utilities,
      resources,
      services,
    };
  }

  async loadExistingFacilities(token) {
    const filter = JSON.stringify({
      fields: {
        facility_name: true,
        district_id: true,
        registration_number: true,
      },
      limit: 100000,
    });

    return this.get('/Facilities', token, { filter });
  }

  attachFacilityId(payloads, facilityId) {
    return payloads.map((payload) =>
      Object.assign({}, payload, { facility_id: facilityId })
    );
  }

  async createFacilityBundle(record, token) {
    const createdFacility = await this.post('/Facilities', record.basic, token);

    await this.post(
      '/Facilities/publish',
      {
        id: createdFacility.id,
        district_id: createdFacility.district_id,
      },
      token
    );

    await this.post(
      '/Facilities/contactDetails',
      {
        data: record.contact,
        id: createdFacility.id,
      },
      token
    );

    if (record.resources.length > 0) {
      await this.post(
        '/FacilityResources',
        this.attachFacilityId(record.resources, createdFacility.id),
        token
      );
    }

    if (record.utilities.length > 0) {
      await this.post(
        '/FacilityUtilities',
        this.attachFacilityId(record.utilities, createdFacility.id),
        token
      );
    }

    if (record.services.length > 0) {
      await this.post(
        '/FacilityServices',
        this.attachFacilityId(record.services, createdFacility.id),
        token
      );
    }

    return createdFacility;
  }
}

module.exports = {
  ApiClient,
};
