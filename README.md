# FlightSurety-project
Here are some Insructions for using my particular project:

## Intial Setup
1. Reset Ganache
2. `npm run compile` (deletes build folder and makes a new one)
3. `truffle migrate`

    The `2_deploy_contracts.js` file registers the 20 different oracles.

4. `truffle exec ./test/test-airlines.js`

    The script being executed adds five airlines using multiparty signing for the fifth one. It also registers the flights displayed in the dapp.

5. `npm run server & npm run dapp` (run on separate windows if you like)

6. Open the dapp and use metamask for switching between addresses.