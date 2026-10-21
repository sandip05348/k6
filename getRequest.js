import http from 'k6/http';
import { group, check, sleep } from 'k6';

const secrets = JSON.parse(open('./secrets.json'));
const API_KEY = __ENV.API_KEY || secrets.apiKey;

if (!API_KEY) {
  throw new Error('No API key found in -e API_KEY or secrets.json');
}

export default function () {
  group('getUsers', function () {
    const url = 'https://reqres.in/api/users';
    const headers = { 'x-api-key': API_KEY };

    const response = http.get(url, { headers });

    //console.log('Response body: ' + response.body);

    check(response, {
      'status is 200': (r) => r.status === 200,
      'has data array': (r) => Array.isArray(r.json('data')),
    });
  });

  sleep(1);
}