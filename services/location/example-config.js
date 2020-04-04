module.exports = {
  /*main.js */
  aisUrl: process.env.AIS_API ? process.env.AIS_API : 'http://localhost:5000',
  dbUrl: process.env.DB_URL ? process.env.DB_URL : 'http://localhost:5984',
  dbUser: process.env.DB_USER ? process.env.DB_USER : 'admin',
  dbPassword: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'admin',
  dbPrefix: process.env.DB_PREFIX ? process.env.DB_PREFIX : '',
  marine_traffic_exportvessel_api_key:
    process.env.marine_traffic_exportvessel_api_key,
  marine_traffic_exportvesseltrack_api_key:
    process.env.marine_traffic_exportvesseltrack_api_key,
  /*mailservice.js*/
  imap_username: process.env.imap_username,
  imap_password: process.env.imap_password,
  imap_host: process.env.imap_host,
};
