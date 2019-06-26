var Test = require('./testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

contract('Flight Surety Tests', async (accounts) => {

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
        let owner = await config.testAddresses[0];
        let contractAddress = await config.flightSuretyApp.address;
        web3.eth.sendTransaction({ from: owner, to: contractAddress, value: web3.utils.toWei('10', 'ether')});
        console.log(contractAddress);
        //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    it('buying insurance', async () => {
        let testAddresses = await config.testAddresses;
        let passenger = testAddresses[2];
        await config.flightSuretyApp.buyInsurance(1001, {from: passenger, value: web3.utils.toWei('0.5', 'ether')});
        let results = await config.flightSuretyData.getFlightInfo.call(1001);
        console.log("bought Insurance:", results);

        //Happens after flight status change
        await config.flightSuretyApp.creditInsurees(1001);
        results = await config.flightSuretyData.getPendingWithdrawal(passenger);
        console.log("credit passengers:", web3.utils.fromWei(results, 'ether'));
    });

    it('withdraw credits', async () => {
        let testAddresses = await config.testAddresses;
        let passenger = testAddresses[2];
        await config.flightSuretyApp.withdrawCredit({from: passenger});
        contractAddress = await config.flightSuretyApp.address;
        //console.log(contractAddress);
        let balance = await web3.eth.getBalance(contractAddress);
        //console.log(web3.utils.fromWei(balance, 'ether'), 'ether');

    });



    
});
