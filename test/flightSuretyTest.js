var Test = require('./testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');
const web3 = new Web3();

contract('Flight Surety Tests', async (accounts) => {

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
        //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    // Operations and Settings

    it(`(operational) has correct initial isOperational() value`, async function () {

        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

        //Getting operating status from the App contract
        let statusApp = await config.flightSuretyApp.isOperational.call();
        assert.equal(statusApp, true, "Incorrect initial operating status value via App");

    });

    it(`(operational) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        }
        catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

    });

    it(`(operational) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false);
        }
        catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

    });

    it(`(operational) can block access to functions using requireIsOperational when operating status is false`, async function () {

        await config.flightSuretyData.setOperatingStatus(false);

        let testFunctions = ['buy', 'creditInsurees', 'pay', 'fund'];

        let reverted = true;
        for (let i = 0; i < testFunctions.length; i++) {
            const func = testFunctions[i];
            try {
                await config.flightSuretyData[func].call();
                reverted = false;
            } catch (e) {

            }
        }

        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);

    });

    it('(airline) register the first airline when the contract is deployed', async () => {
        let isRegistered = await config.flightSuretyApp.isAirlineRegistered(config.firstAirline);
        assert.equal(isRegistered, true, "The first airline is not registered");

        let testAddresses = await config.testAddresses;
        for (let i = 2; i < testAddresses.length; i++) {
            const element = testAddresses[i];
            isRegistered = await config.flightSuretyApp.isAirlineRegistered(element);
            assert.equal(isRegistered, false, "Other airline is also registered");
        }
    });

    it('(airline) register subsequent airlines (less than 4)', async () => {
        let testAddresses = await config.testAddresses;
        //Test if firstAirline can register another
        let test = await config.flightSuretyApp.registerAirline(testAddresses[2], { from: config.firstAirline });
        //Test emitted event "AirlineAdded"
        await truffleAssert.eventEmitted(test, 'AirlineAdded', (ev) => {
            return ev.airline == testAddresses[2];
        });
        //Verify that the airline was registered
        let isRegistered = await config.flightSuretyApp.isAirlineRegistered(testAddresses[2]);
        assert.equal(isRegistered, true, "Airline[2] was not registered");

         //Test if Airline[2] can register another without paying the ante (it shouldn't)
        await truffleAssert.reverts(
            config.flightSuretyApp.registerAirline(testAddresses[3], { from: testAddresses[2] }),
            "This airline has not paid the Ante yet"
        );
        isRegistered = await config.flightSuretyApp.isAirlineRegistered(testAddresses[3]);
        assert.equal(isRegistered, false, "Airline[3] should not have been registered"); 

        //Test if the Airline[2] can pay the Ante and then register another airline
        await config.flightSuretyApp.payAnte({ from: testAddresses[2], value: web3.utils.toWei('10', 'ether') });
        await config.flightSuretyApp.registerAirline(testAddresses[3], { from: testAddresses[2] });
        isRegistered = await config.flightSuretyApp.isAirlineRegistered(testAddresses[3]);
        assert.equal(isRegistered, true, "Airline[3] should have been registered");
    });

    it('(airline) register a flight', async () => {
        let testAddresses = config.testAddresses;
        //Have a member airline register a flight
        await config.flightSuretyApp.registerFlight("A1001", { from: testAddresses[1] });
        await config.flightSuretyApp.registerFlight("A1002", { from: testAddresses[1] });
        await config.flightSuretyApp.registerFlight("A1003", { from: testAddresses[1] });
    });

    it('(multiparty) register subsequent airlines (4 and greater)', async () => {
        let testAddresses = await config.testAddresses;
        //Register and ante-up the third and fourth airline
        await config.flightSuretyApp.payAnte({ from: testAddresses[3], value: web3.utils.toWei('10', 'ether') });
        await config.flightSuretyApp.registerAirline(testAddresses[4], { from: testAddresses[3] });
        await config.flightSuretyApp.payAnte({ from: testAddresses[4], value: web3.utils.toWei('10', 'ether') });

        //Test if adding an Airline[5] airline would fall to a vote
        let test = await config.flightSuretyApp.registerAirline(testAddresses[5], { from: testAddresses[4] });
        truffleAssert.eventNotEmitted(test, "AirlineAdded", async (ev) => {
            console.log(ev);
        });
        //Registation would pass once the second vote comes in
        test = await config.flightSuretyApp.registerAirline(testAddresses[5], { from: testAddresses[3] });
        truffleAssert.eventEmitted(test, "AirlineAdded", async (ev) => {
            assert.equal((ev.airline == testAddresses[5]), true, "Airline[5] not added");
        });
    });
/*
    it('(oracles) register an oracle', async () => {
        let oracleAddresses = await config.oracleAddresses;
        let oracleIndexes  = [];
        await config.flightSuretyApp.registerOracle({ from: oracleAddresses[0], value: web3.utils.toWei('1', 'ether') });
        await config.flightSuretyApp.registerOracle({ from: oracleAddresses[1], value: web3.utils.toWei('1', 'ether') });
        await config.flightSuretyApp.registerOracle({ from: oracleAddresses[2], value: web3.utils.toWei('1', 'ether') });

        oracleIndexes.push(await config.flightSuretyApp.getMyIndexes({ from: oracleAddresses[0] }));
        oracleIndexes.push(await config.flightSuretyApp.getMyIndexes({ from: oracleAddresses[1] }));
        oracleIndexes.push(await config.flightSuretyApp.getMyIndexes({ from: oracleAddresses[2] }));
    });

*/

    
});
