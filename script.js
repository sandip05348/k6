import http from 'k6/http';
import { check, sleep } from 'k6';

const profiles = {
  smoke:  [{ duration: '30s', target: 1 }],
  load:   [{ duration: '1m', target: 20 }, { duration: '3m', target: 20 }, { duration: '1m', target: 0 }],
  stress: [{ duration: '1m', target: 20 }, { duration: '2m', target: 50 }, { duration: '2m', target: 100 }, { duration: '1m', target: 0 }],
  spike:  [{ duration: '30s', target: 5 }, { duration: '10s', target: 100 }, { duration: '1m', target: 100 }, { duration: '10s', target: 5 }, { duration: '30s', target: 0 }],
};
const type = __ENV.TEST_TYPE || 'smoke';

export const options = {
  stages: profiles[type],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const res = http.get('https://quickpizza.grafana.com/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body is not empty': (r) => r.body && r.body.length > 0,
  });
  sleep(1);
}