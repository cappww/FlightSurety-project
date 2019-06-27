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
}