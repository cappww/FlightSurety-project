module.exports = async (callback) => {
    const FlightSuretyApp = artifacts.require("FlightSuretyApp");
    let instance = await FlightSuretyApp.deployed();
    console.log(instance.address);
    
    
    callback();
}