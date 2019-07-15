var FlightSuretyData = artifacts.require("FlightSuretyData");
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var BigNumber = require('bignumber.js');

var Config = async function (accounts) {

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

    //Account 0 is the owner
    //Account 1 is the first airline

    let owner = accounts[0];
    let firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.deployed();
    let flightSuretyApp = await FlightSuretyApp.deployed(flightSuretyData.address);


    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};