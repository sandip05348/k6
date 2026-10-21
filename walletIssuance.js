import http from 'k6/http';
import { check, group, sleep } from 'k6';

const URL = 'http://localhost:3000/pp-corporate/prepaid/corporate/v1/wallet-issuances/';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  group('wallet issuance', () => {
    // Unique application number per request so each call looks different
    const appNo = `${__VU}${__ITER}`.padStart(5, '0');

    const payload = JSON.stringify({
      applicationNumber: appNo,
      customers: [{
        firstName: 'Test',
        lastName: 'User',
        entityId: appNo,
        mobile: { value: '9000000000', countryCode: 91 },
        product: { productId: 'DUMMY', productType: 'Wallet', name: 'TEST' },
      }],
    });

    const res = http.post(URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-TENANT-ID': 'test',
      },
    });

    check(res, {
      'status is 200': (r) => r.status === 200,
      'status is SUCCESS': (r) => r.json('status') === 'SUCCESS',
      'wallet id returned': (r) => !!r.json('customers.0.walletId'),
      'application number echoed': (r) => r.json('applicationNumber') === appNo,
    });
  });

  sleep(1);
}