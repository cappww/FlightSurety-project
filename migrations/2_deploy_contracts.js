const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3();
const db = require('../src/server/db.json')


module.exports = async(deployer) => {
    await deployer.deploy(FlightSuretyData);
    await deployer.deploy(FlightSuretyApp, FlightSuretyData.address);

    //Flights would be registered from the AirlineManager Contract
    let dataInstace = await FlightSuretyData.deployed();
    let flights = db.flights;
    flights.forEach(async(flight) => {
        await dataInstace.registerFlight(flight);
        console.log(flight, "Registered");
    });

    
           
    let config = {
        localhost: {
            url: 'http://localhost:7545',
            dataAddress: FlightSuretyData.address,
            appAddress: FlightSuretyApp.address
        }
    }
    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
           
   
}