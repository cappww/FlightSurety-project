var Test = require('./testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

contract('Flight Surety Tests', async (accounts) => {

    var config;
    var owner;
    var firstAirline;
    var contractAddress;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
        owner = await config.testAddresses[0];
        firstAirline = await config.firstAirline;
        contractAddress = await config.flightSuretyApp.address;
        //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    it('fetch flight status', async () => {
        let testAddresses = await config.testAddresses;
        let passenger = testAddresses[2];
        let flight = 1001
        let test = await config.flightSuretyApp.fetchFlightStatus(firstAirline, flight, Date.now(), {from: passenger});
        let index = 0;
        let timestamp = 0;

        await truffleAssert.eventEmitted(test, 'OracleRequest', async (ev) => {
            console.log()
            index = ev.index;
            timestamp = ev.timestamp;
        });

        
    });
});
