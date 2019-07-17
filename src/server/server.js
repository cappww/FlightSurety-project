const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
const Web3 = require('web3');
const Config = require('./config.json');
const express = require('express');
const port = 3000;

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url));
web3.eth.defaultAccount = web3.eth.accounts[0];
let oracles = require('./oracle-indices.json');

let airline = '0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18';

class Server {
    constructor() {
        this.flightSuretyApp = web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.app = express();
        this.watchFlightStatusInfo();
        this.watchOracleReport();
        this.watchOracleRequest();
        this.startServer();
    }

    watchFlightStatusInfo() {
        this.flightSuretyApp.events.FlightStatusInfo(
            {fromBlock: 'latest'},
            async (err, ev) => {
                if(err) console.log(err);
                else {
                    console.log(
                        "FlightStatusInfo\n ",
                        ev.returnValues.airline, "\n ",
                        ev.returnValues.flight.toNumber(), "\n ",
                        ev.returnValues.timestamp.toNumber(), "\n ",
                        ev.returnValues.status, "\n"
                    )
                }
            }
        );
    }

    watchOracleReport(){
        this.flightSuretyApp.events.OracleReport(
            { fromBlock: 'latest' },
            async (err, ev) => {
                if(err) console.log(err);
                else {
                    console.log(
                        "OracleReport\n ",
                        ev.returnValues.airline, "\n ",
                        ev.returnValues.flight.toNumber(), "\n ",
                        ev.returnValues.timestamp.toNumber(), "\n ",
                        ev.returnValues.status, "\n"
                    )
                }
            }
        )
    }

    watchOracleRequest(){
        this.flightSuretyApp.events.OracleRequest(
            { fromBlock: 'latest' }, 
            async (err, ev) => {
                if(err) console.log(err);
                else {
                    console.log(
                        "OracleRequest\n ",
                        ev.returnValues.index, "\n ",
                        ev.returnValues.airline, "\n ",
                        ev.returnValues.flight.toNumber(), "\n ",
                        ev.returnValues.timestamp.toNumber(), "\n ",
                    )
                    let index = ev.returnValues.index;
                    let status = 20;//Math.floor(Math.random() * 6) * 10;

                    for (const address in oracles) {
                        if (oracles.hasOwnProperty(address)) {
                            const indices = oracles[address];
                            for (const oracleIndex of indices) {
                                if(oracleIndex === index){
                                    this.flightSuretyApp.methods.submitOracleResponse(
                                        ev.returnValues.index,
                                        ev.returnValues.airline,
                                        ev.returnValues.flight,
                                        ev.returnValues.timestamp,
                                        status
                                    ).send({
                                        from: address,
                                        gas: 6721975
                                    });
                                }
                            }
                        }
                    }
                }
            }
        )
    }

    startServer() {
        this.app.listen(port, () => console.log(`App listening on port ${port}`));
    }
}

new Server();