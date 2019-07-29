# Flight Surety DApp
This project has three main aspects: the smartcontract, the UI, and the server. The server represents the oracle responses that the smartcontract would recieve when fetching flight information. The smartcontracts are separated into two contracts: flightSuretyApp, which is the business logic of the application, and flightSuretyData, which manages user, flight, and, oracle information.

## Intial Setup
1. Run/ Reset Ganache
2. `npm run compile` (deletes build folder and makes a new one)
3. `truffle migrate`

    The `2_deploy_contracts.js` file registers the 20 different oracles.

4. `truffle exec ./test/test-airlines.js`

    The script being executed adds five airlines using multiparty signing for the fifth one. It also registers the flights displayed in the dapp.

5. `npm run server & npm run dapp` (run on separate windows if you like)

6. Open the dapp and use metamask for switching between addresses.