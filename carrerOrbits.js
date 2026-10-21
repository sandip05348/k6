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

export const options = {
  vus: 1,            // raise for real load, e.g. 10
  iterations: 1,     // or use duration: '1m'
  thresholds: {
    http_req_failed:   ['rate<0.01'],   // <1% errors
    http_req_duration: ['p(95)<3000'],  // 95% of requests under 3s
  },
};

export default function () {
  for (const page of PAGES) {
    // One group per page = separate timing/check results in the summary
    group(page.name, () => {
      const res = http.get(`${BASE}${page.path}`, {
        tags: { page: page.name },
      });

      check(res, {
        [`${page.name}: status is 200`]: (r) => r.status === 200,
        [`${page.name}: body is not empty`]: (r) => r.body && r.body.length > 0,
        [`${page.name}: loaded under 3s`]: (r) => r.timings.duration < 3000,
        [`${page.name}: title contains "${page.title}"`]: (r) =>
          (r.html('title').text() || '').toLowerCase().includes(page.title.toLowerCase()),
      });
    });

    sleep(1); // think time before "clicking" the next link
  }
}