describe('databases', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('Initialize databases [PRODUCTION]', () => {
    const dbUser = 'foo';
    const dbPassword = 'bar';
    process.env.DB_USER = dbUser;
    process.env.DB_PASSWORD = dbPassword;
    process.env.DEVELOPMENT = '';

    const locsvc = require('../LocationService.ts');

    const l = new locsvc.LocationService();
    const expectedOpts = {
      auth: {
        password: dbPassword,
        username: dbUser,
      },
    };

    l.initDBs();

    expect(l.itemDB.__opts).toMatchObject(expectedOpts);
    expect(l.locationsDB.__opts).toMatchObject(expectedOpts);
  });

  test('Initialize databases [DEVELOPMENT]', () => {
    process.env.DEVELOPMENT = 'true';

    const locsvc = require('../LocationService.ts');

    const l = new locsvc.LocationService();

    l.initDBs();

    expect(l.itemDB.__opts).not.toHaveProperty('auth');
    expect(l.locationsDB.__opts).not.toHaveProperty('auth');
  });

  test('Initialize databases with custom URL and prefix', () => {
    process.env.DB_URL = 'http://example.com:1234';
    process.env.DB_PREFIX = 'exotic-';

    const locsvc = require('../LocationService.ts');

    const l = new locsvc.LocationService();

    l.initDBs();

    expect(l.itemDB.name).toBe(
      `${process.env.DB_URL}/${process.env.DB_PREFIX}items`
    );
    expect(l.locationsDB.name).toBe(
      `${process.env.DB_URL}/${process.env.DB_PREFIX}positions`
    );
  });
});
