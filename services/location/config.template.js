module.exports = {
  /*main.js */
  aisUrl: process.env.AIS_API ? process.env.AIS_API : 'http://localhost:5000',
  dbUrl: process.env.DB_URL ? process.env.DB_URL : 'http://localhost:5984',
  dbUser: process.env.DB_USER ? process.env.DB_USER : 'admin',
  dbPassword: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'admin',
  dbPrefix: process.env.DB_PREFIX ? process.env.DB_PREFIX : '',
  marine_traffic_exportvessel_api_key:
    process.env.MARINE_TRAFFIC_EXPORTVESSEL_API_KEY,
  marine_traffic_exportvesseltrack_api_key:
    process.env.MARINE_TRAFFIC_EXPORTVESSELTRACK_API_KEY,
  /*mailservice.js*/
  imap_username: process.env.IMAP_USERNAME,
  imap_password: process.env.IMAP_PASSWORD,
  imap_host: process.env.IMAP_HOST,
};
