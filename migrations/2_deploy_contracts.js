const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3();

const oracles = [
    '0x9c7401407281f299C2D28384C953B7d6D1Ea10A3',
    '0xc707dbDbf3a2Ae350245e0969F65f3b973CC22be',
    '0x51eD9D0675391Ba00A6324A6d23C3574692CCF01',
    '0x7c2C7A0f6907b9E3b169F00bb24735e13af6Eaf2',
    '0xB7bD7a0d3Ce231CD3FAc551700F81D94AE9D7494',
    '0x7Bb7133c29CeA12d8D1563a95AFCb3300155C81F',
    '0x8E927D00B7402533E10eabcFf90369B4c9863699',
    '0xFF36dB3B73C133968978079D59CF5961eAC67065',
    '0x81c556FFE9F58BE2E16cfE8CF46f4d4fBe12675D',
    '0xe6ebA5013d2a22249eB97F0dA78A539C11e6bd48',
    '0x2f4bB1d4b5e6ca6015D1dc0738c3b57863573134',
    '0x53dEB7b55d6ccDfD737B0E47705aeB4a662D7D1A',
    '0x62e5141133872aD61bAa50152F5C7e48A837a93c',
    '0x978F54Bb3aAA20910D1989aa07B41036D71e590f',
    '0xbf265bf4B5FDab9ca1314EEB2ae5AB25Bd23f89F',
    '0x029bcD6E2EA8E1ec62cCfC3cFc13E52B57efF98E',
    '0x20dD2e4d9fB395aaF7E4c4F5B92428b13CDf310F',
    '0xe645aF82A2131c0961b304d4d220b26624796169',
    '0x4Bf3191Be112D04E924f0d2419E0C230E2C7876F',
    '0x736C589d68204ed004f1E02Ba3312Aa1D0439E29']

module.exports = async(deployer) => {
<<<<<<< HEAD
    await deployer.deploy(FlightSuretyData);
    await deployer.deploy(FlightSuretyApp, FlightSuretyData.address);
=======

    let firstAirline = '0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18';
    await deployer.deploy(FlightSuretyData);
    await deployer.deploy(FlightSuretyApp, FlightSuretyData.address, firstAirline);

    let flightApp = await FlightSuretyApp.deployed();
    console.log("Oracles");
    for (let i = 0; i < oracles.length; i++) {
        const oracle = oracles[i];
        await flightApp.registerOracle({ from: oracle, value: web3.utils.toWei('1', 'ether') });
        console.log(oracle, await flightApp.getMyIndexes({ from: oracle }));
    }
>>>>>>> 2e6b335e50c65125d848bf214e2025679b84d99e
    
           
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