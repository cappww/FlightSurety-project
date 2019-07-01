import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

flightSuretyApp.events.OracleReport({
    fromBlock: 0
  }, async (err, event) => {
    if (err) console.log(err)
    else {
      console.log("OracleResponse", event);
    }
    
  }
);

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, async (error, event) => {
    if (error) console.log(error)
    else {
      //console.log("event:", event)
      let status = Math.floor(Math.random() * 6) * 10;
      flightSuretyApp.methods.submitOracleResponse(
        event.returnValues.index,
        event.returnValues.airline,
        event.returnValues.flight,
        event.returnValues.timestamp,
        event.returnValues.status,
        {from: web3.eth.defaultAccount}
      )

      

      //console.log("request received", event.returnValues.flight.toNumber());
    }
    //console.log("event:", event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


