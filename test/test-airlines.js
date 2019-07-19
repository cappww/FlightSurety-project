const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');
Config = require('../src/server/config.json');
let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];

let testAddresses = [
    "0xC485652B083fBC268FaE28b9c26Bb0CccD761679",
    "0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18",
    "0x667F2761d1030c473729fAe340C2A343663c2459",
    "0x7f8d24084Ef7C56cB26ABCA4d253F477ef6Ad876",
    "0x4f6E29137328F52ad609E09eA690E900d42bCE6e",
    "0x9224f27e0A3D939f0bE759fb563Dd4152d497e3A",
    "0x64F480c2D43AAcB378F5a841dbD535670E293fFE",
    "0x3E5A54d18Aaaf1d91967c4E6ac93b7E1c14D1b62",
    "0x5209154318f198F7bD22b23CAeA9EFa3A734bC7c",
    "0x5eB9112B0165a3d72490f6e2ACB82484035dED1C"
];
let owner = testAddresses[0];
let firstAirline = testAddresses[1];


module.exports = async (callback) => {
    const FlightSuretyApp = artifacts.require("FlightSuretyApp");
    let flightSuretyApp = await FlightSuretyApp.deployed();

    //Test 1: RegisterAirline
    try {
        console.log('(airline) register the first airline when the contract is deployed');
        let isRegistered = await flightSuretyApp.isAirlineRegistered(firstAirline);
        console.assert(isRegistered, "The first airline is not registered");

        for (let i = 2; i < testAddresses.length; i++) {
            const element = testAddresses[i];
            isRegistered = await flightSuretyApp.isAirlineRegistered(element);
            console.assert(!isRegistered, "There is another airline that is registered but should not be");
        }
    } catch (error) {
        console.log(error);
    }

    //Test 2: Register More Airlines
    try {
        console.log('(airline) register subsequent airlines (less than 4)');
        //Pay the ante first
        await flightSuretyApp.payAnte({ from: firstAirline, value: web3.utils.toWei('10', 'ether')});
        //Test if firstAirline can register another
        let test = await flightSuretyApp.registerAirline(testAddresses[2], { from: firstAirline });
        //Test emitted event "AirlineAdded"
        await truffleAssert.eventEmitted(test, 'AirlineAdded', (ev) => {
            return ev.airline == testAddresses[2];
        });
        //Verify that the airline was registered
        let isRegistered = await flightSuretyApp.isAirlineRegistered(testAddresses[2]);
        console.assert(isRegistered, "Airline[2] was not registered");

        //Test if Airline[2] can register another without paying the ante (it shouldn't)
        await truffleAssert.reverts(
            flightSuretyApp.registerAirline(testAddresses[3], { from: testAddresses[2] }),
            "This airline has not paid the Ante yet"
        );
        isRegistered = await flightSuretyApp.isAirlineRegistered(testAddresses[3]);
        console.assert(!isRegistered, "Airline[3] should not have been registered");

        //Test if the Airline[2] can pay the Ante and then register another airline
        await flightSuretyApp.payAnte({ from: testAddresses[2], value: web3.utils.toWei('10', 'ether') });
        await flightSuretyApp.registerAirline(testAddresses[3], { from: testAddresses[2] });
        isRegistered = await flightSuretyApp.isAirlineRegistered(testAddresses[3]);
        console.assert(isRegistered, "Airline[3] should have been registered");
    } catch (error) {
        console.log(error)
    }

    //Test 3: Register Flights
    try {
        console.log('(airline) register a flight');
        //Have a member airline register a flight
        await flightSuretyApp.registerFlight(1001, { from: testAddresses[1] });
        await flightSuretyApp.registerFlight(1002, { from: testAddresses[1] });
        await flightSuretyApp.registerFlight(1003, { from: testAddresses[2] });
        await flightSuretyApp.registerFlight(1004, { from: testAddresses[2] });
    } catch (error) {
        console.log(error);
    }

    //Test 4: Register Additional Airlines
    try {
        console.log('(multiparty) register subsequent airlines (4 and greater)');
        //Register and ante-up the third and fourth airline
        await flightSuretyApp.payAnte({ from: testAddresses[3], value: web3.utils.toWei('10', 'ether') });
        await flightSuretyApp.registerAirline(testAddresses[4], { from: testAddresses[3] });
        await flightSuretyApp.payAnte({ from: testAddresses[4], value: web3.utils.toWei('10', 'ether') });

        //Test if adding an Airline[5] airline would fall to a vote
        let test = await flightSuretyApp.registerAirline(testAddresses[5], { from: testAddresses[4] });
        truffleAssert.eventNotEmitted(test, "AirlineAdded", async (ev) => {
            console.log(ev);
        });
        //Registation would pass once the second vote comes in
        test = await flightSuretyApp.registerAirline(testAddresses[5], { from: testAddresses[3] });
        truffleAssert.eventEmitted(test, "AirlineAdded", async (ev) => {
            console.assert((ev.airline == testAddresses[5]), "Airline[5] not added");
        });
    } catch (error) {
        console.log(error);
    }
    
    
    callback();

    
}