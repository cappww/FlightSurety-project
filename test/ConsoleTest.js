<<<<<<< HEAD
class ConsoleTest {
    constructor(contract) {
        this.initialize(contract);
    }

    async initialize(contract) {
        this.instance = await contract.deployed();
        console.log("contract", contract.address, "deployed");
        this.airline = "0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18"
        this.passenger = "0x667F2761d1030c473729fAe340C2A343663c2459"
    }

    async fetchFlightStatus() {
        await this.instance.fetchFlightStatus(
            this.airline, 
            1001, 
            Date.now(), 
            {from: this.passenger}
        )
        console.log("function success");
    }

}

module.exports = {
    ConsoleTest: ConsoleTest
=======
let AirlineAddresses = [
        "0xC485652B083fBC268FaE28b9c26Bb0CccD761679", //Owner
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
const fs = require('fs');
const instance = FlightSuretyApp.deployed().then((res)=>{
    console.log(res.address);
});


module.exports = {
    isOperational: async (appInstance) => {
        return await appInstance.isOperational();
    },

    addFlights: async (appInstance) => {
        const db = require('../src/server/db.json');
        await appInstance.registerFlight(db.flights[0], {from: AirlineAddresses[1]});
        await appInstance.registerFlight(db.flights[1], {from: AirlineAddresses[1]});
        await appInstance.registerFlight(db.flights[2], {from: AirlineAddresses[1]});
        console.log("db:", db);
        fs.writeFileSync('./src/server/db.json', JSON.stringify(db));
    }

>>>>>>> 2e6b335e50c65125d848bf214e2025679b84d99e
}