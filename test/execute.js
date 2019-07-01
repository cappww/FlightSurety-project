const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');
Config = require('../src/server/config.json')
let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];



module.exports = async (callback) => {
    let airline = '0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18';
    const FlightSuretyApp = artifacts.require("FlightSuretyApp");
    let instance = await FlightSuretyApp.deployed();


    //await instance.submitOracleResponse(
    //    0, airline, 1004, Date.now(), 50
   // )
    await instance.fetchFlightStatus(airline, 1005, Date.now());
    //truffleAssert.prettyPrintEmittedEvents(test);
    
    
    callback();
}