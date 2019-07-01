const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
const Web3 = require('web3');
const Config = require('./config.json');
const express = require('express');
const port = 3000;

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url));
web3.eth.defaultAccount = web3.eth.accounts[0];

let airline = '0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18';

class Server {
    constructor() {
        this.flightSuretyApp = web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.app = express();
        
        
        //this.test();

        this.watchOracleRequest();
        this.startServer();
    }

    async test() {
        console.log(await this.flightSuretyApp.methods.getRandomIndex('0x667F2761d1030c473729fAe340C2A343663c2459').call())
    }

    watchOracleRequest(){
        this.flightSuretyApp.events.OracleRequest({
            fromBlock: 0
        }, async (err, ev) => {
            if(err) console.log(err);
            else {
                console.log(ev);
            }
        })
    }

    startServer() {
        //this.app.listen(port, () => console.log(`App listening on port ${port}`));
    }
}

new Server();