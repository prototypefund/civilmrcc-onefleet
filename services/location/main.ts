const request = require('request');

const moment = require('moment');

const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const MailListener = require('mail-listener2');

const program = require('commander');

program
  .option('-t <min>', 'run interval')
  .option('-c <number>', 'generate testcases')
  .option('-i <filename>', 'import from csv file')
  .option('-l', 'fetches locations once')
  .option('-d <date>', 'delete locations older than ')
  .option('-m, --mail', 'activate mail')
  .option('-p, --purchase', 'purchase locations if api key is provided')
  .version('0.0.1');

program.parse(process.argv);
let INTERVAL = program.time || 10;

let service = new LocationService();

if (program.T) {
  service.fetchAPIInterval(program.T);
}
if (program.L) {
  service.fetchAPIs();
}
if (program.mail) {
  service.initMail();
}
if (program.C) {
  service.generateTestCases(program.C);
}
if (program.I) {
  service.importFromCSV(program.I);
}
if (program.D) {
  service.deletePositionsOlderThan(program.D);
}
//service.initMail();

module.exports = {
  LocationService: LocationService,
  config: config,
  pouchDB: pouchDB,
};
