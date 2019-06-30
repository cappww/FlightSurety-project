const truffleAssert = require('truffle-assertions');


module.exports = async (callback) => {
    let airline = '0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18';
    const FlightSuretyApp = artifacts.require("FlightSuretyApp");
    let instance = await FlightSuretyApp.deployed();

    try {
        let test = await instance.fetchFlightStatus(airline, 1001, Date.now());
        //truffleAssert.prettyPrintEmittedEvents(test);
        let event = await instance.contract.events.OracleReport();

        console.log(event);

    } catch (error) {
        console.log(error)
    }
    
    
    callback();
}