import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE = 'https://www.careerorbits.com';

// Nav menu links, in the same order as the site header
const PAGES = [
  { name: 'HOME',       path: '/',                                                       title: 'CareerOrbits' },
  { name: 'JEE ADV',    path: '/jee-advanced/iit-jee-advanced-preparation-courses',      title: 'JEE Advanced' },
  { name: 'JEE MAIN',   path: '/jee-main/jee-main-prep-courses',                         title: 'JEE Main' },
  { name: 'NEET UG',    path: '/neet/neet-ug-aipmt-aiims-pmt-preparation-courses',       title: 'NEET' },
  { name: 'FEATURES',   path: '/features',                                               title: 'Features' },
  { name: 'HELP',       path: '/help',                                                   title: 'Help' },
  { name: 'CONTACT US', path: '/courses/contact-us',                                     title: 'Contact' },
  { name: 'BUY',        path: '/courses/buy',                                            title: 'Buy' },
  { name: 'TRIAL',      path: '/courses/free-trial',                                     title: 'Trial' },
];

const profiles = {
  smoke:  [{ duration: '30s', target: 1 }],
  load:   [{ duration: '1m', target: 20 }, { duration: '3m', target: 20 }, { duration: '1m', target: 0 }],
  stress: [{ duration: '1m', target: 20 }, { duration: '2m', target: 50 }, { duration: '2m', target: 100 }, { duration: '1m', target: 0 }],
  spike:  [{ duration: '30s', target: 5 }, { duration: '10s', target: 100 }, { duration: '1m', target: 100 }, { duration: '10s', target: 5 }, { duration: '30s', target: 0 }],
};

const type = __ENV.TEST_TYPE || 'smoke';

if (!profiles[type]) {
  throw new Error(`Unknown TEST_TYPE "${type}". Use: ${Object.keys(profiles).join(', ')}`);
}

export const options = {
  stages: profiles[type],
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  for (const page of PAGES) {
    group(page.name, () => {
      const res = http.get(`${BASE}${page.path}`, {
        tags: { page: page.name },
      });

      // Temporary: shows the real <title> so you can fix the keywords (remove when done)
      console.log(`${page.name} -> ${res.status} | title: ${res.html('title').text()}`);

      check(res, {
        [`${page.name}: status is 200`]: (r) => r.status === 200,
        [`${page.name}: body is not empty`]: (r) => r.body && r.body.length > 0,
        [`${page.name}: loaded under 3s`]: (r) => r.timings.duration < 3000,
        [`${page.name}: title contains "${page.title}"`]: (r) =>
          (r.html('title').text() || '').toLowerCase().includes(page.title.toLowerCase()),
      });
    });

    sleep(1);
  }
}