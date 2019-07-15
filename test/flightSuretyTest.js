var FlightSuretyData = artifacts.require("FlightSuretyData");
const FlightSuretyApp = require('../build/contracts/FlightSuretyApp.json');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));
const Config = require('../src/server/config.json');
let config = Config['localhost'];
const flightSuretyApp = web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


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

contract('Flight Surety Tests', async (accounts) => {

    before('setup contract', async () => {
        let owner = testAddresses[0];
        let contractAddress = flightSuretyApp.address;
        //console.log(contractAddress);
        //web3.eth.sendTransaction({ from: owner, to: contractAddress, value: web3.utils.toWei('10', 'ether')});
        //console.log(contractAddress);
        //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    it('buying insurance', async () => {
        //const flightSuretyData = await FlightSuretyData.deployed();
        let passenger = testAddresses[2];
        let result = await flightSuretyApp.methods.getFlightInfo(1001).call();
        console.log(result);
        flightSuretyApp.methods.buyInsurance(1001).send({ 
            from: passenger, 
            value: web3.utils.toWei('1', 'ether'),
            gas: 6721975
        });
        
        

        //Happens after flight status change
        // await config.flightSuretyApp.creditInsurees(1001);
        // results = await config.flightSuretyData.getPendingWithdrawal(passenger);
        // console.log("credit passengers:", web3.utils.fromWei(results, 'ether'));
    });

    it('does it work', async() => {
        let result = await flightSuretyApp.methods.getFlightInfo(1001).call();
        console.log(result);
    });
/*
    it('withdraw credits', async () => {
        let testAddresses = await config.testAddresses;
        let passenger = testAddresses[2];
        await config.flightSuretyApp.withdrawCredit({from: passenger});
        contractAddress = await config.flightSuretyApp.address;
        //console.log(contractAddress);
        let balance = await web3.eth.getBalance(contractAddress);
        //console.log(web3.utils.fromWei(balance, 'ether'), 'ether');
    }); 
    */   
});
