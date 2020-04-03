const { getApp } = require('../app');
const request = require('supertest');

describe('example app', () => {
  it('returns Swagger document correctly', async () => {
    const app = await getApp();

    const response = await request(app).get('/api-docs');
    expect(response.body).toMatchSnapshot();
  });
});
