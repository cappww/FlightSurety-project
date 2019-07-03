const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
const Web3 = require('web3');
const Config = require('./config.json');
const express = require('express');
const contract = require('truffle-contract');
const truffleAssertions = require('truffle-assertions')
const port = 3000;

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url));
web3.eth.defaultAccount = web3.eth.accounts[0];

let airline = '0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18';
let oracle = '0x5eB9112B0165a3d72490f6e2ACB82484035dED1C';

class Server {
    constructor() {
        this.flightSuretyApp = web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.app = express();
        this.watchOracleReport();
        this.watchOracleRequest();
        this.startServer();
    }

    watchOracleReport(){
        this.flightSuretyApp.events.OracleReport(
            { fromBlock: 0 },
            async (err, ev) => {
                if(err) console.log(err);
                else {
                    console.log(
                        "OracleReport\n ",
                        ev.returnValues.airline, "\n ",
                        ev.returnValues.flight, "\n ",
                        ev.returnValues.timestamp, "\n ",
                        ev.returnValues.status,
                    )
                }
            }
        )
    }

    watchOracleRequest(){
        this.flightSuretyApp.events.OracleRequest(
            { fromBlock: 0 }, 
            async (err, ev) => {
                if(err) console.log(err);
                else {
                    console.log(
                        "OracleRequest\n ",
                        ev.returnValues.index, "\n ",
                        ev.returnValues.airline, "\n ",
                        ev.returnValues.flight, "\n ",
                        ev.returnValues.timestamp, "\n ",
                    )
                    let status = Math.floor(Math.random() * 6) * 10;
                    await this.flightSuretyApp.methods.submitOracleResponse(
                        ev.returnValues.index,
                        ev.returnValues.airline,
                        ev.returnValues.flight,
                        ev.returnValues.timestamp,
                        status
                    ).send({from: oracle});
                }
            }
        )
    }

    startServer() {
        this.app.listen(port, () => console.log(`App listening on port ${port}`));
    }
}

new Server();