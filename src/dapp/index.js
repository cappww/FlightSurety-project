import DOM from './dom';
import './flightsurety.css';

const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
const Config = require('./config.json');
const Web3 = require('web3');
const db = require('../server/db.json'); 
let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
const flightSuretyApp = web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let web3Provider = null;




(async() => {
    if (window.ethereum) {
        web3Provider = window.ethereum;
        try {
            await window.ethereum.enable();
        } catch (error) {
            console.error("User denied account access")
        }
    }
    else if (window.web3) {
        web3Provider = window.web3.currentProvider;
    }
    else {
        web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    let getMetaMaskID = (async() => {
        web3 = new Web3(web3Provider);
        let metamaskID = "";
        await web3.eth.getAccounts((err, res) => {
            if(err) console.log(err);
            else {
                metamaskID = res[0];
                return res[0];
            }
        });
        return metamaskID;
    });

    //Display the account number of the current user
    let header = DOM.elid("header");
    header.innerText += " " + (await getMetaMaskID()).slice(0, 10) + "...";

    
    //Adds each flight number into the options of the selector
    let selector = DOM.elid("selector");
    let statusSel = DOM.elid("status-selector");
    let flights = db.flights;
    flights.forEach(flight => {
        selector.append(DOM.option(flight.toString()));
        statusSel.append(DOM.option(flight.toString()));
    });
    
    //Provides the range for the amount of ether being insured
    let lbl = document.getElementById("lbl");
    let etherRange = document.getElementById("cost");
    etherRange.oninput = async () => {
        lbl.innerText = etherRange.value;
    }

    let isOperational = await flightSuretyApp.methods.isOperational().call({ from: await getMetaMaskID() });
    console.log("isOperational:", isOperational);
    display('Operational Status', 'Check if contract is operational',
        [{
            label: 'Operational Status',
            value: isOperational
        }]
    );
    
    DOM.elid('insure-flight').addEventListener('click', async() => {
        flightSuretyApp.methods.buyInsurance(Number(selector.value)).send({
            from: await getMetaMaskID(),
            value: web3.utils.toWei(etherRange.value, "ether"),
            gas: 6721975
        }).then(console.log(`Flight ${selector.value} Insured for ${etherRange.value} ether`));
    });

    let airline = '0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18';
    DOM.elid('submit-oracle').addEventListener('click', async() => {
        let flight = Number(statusSel.value);
        
        await flightSuretyApp.methods.fetchFlightStatus(airline, flight, Date.now()).send({
            from: await getMetaMaskID()
        });
    });

    let balance = DOM.elid('balance');
    let amount = await flightSuretyApp.methods.getPendingWithdrawal().call({from: await getMetaMaskID()});
    amount = web3.utils.fromWei(amount.toString(), 'ether');
    balance.innerText = `Your balance is ${amount} ether`;

    DOM.elid('credit').addEventListener('click', async() => {
        flightSuretyApp.methods.withdrawCredit().send({
            from: await getMetaMaskID()
        });
        amount = await flightSuretyApp.methods.getPendingWithdrawal().call({ from: await getMetaMaskID() });
        amount = web3.utils.fromWei(amount.toString(), 'ether');
        balance.innerText = `Your balance is ${amount} ether`;
        console.log(`${amount} ether has been sent to you`);
    });

    //Display the change in status onto the dApp
    flightSuretyApp.events.FlightStatusInfo(
        { fromblock: 'latest' },
        async (err, ev) => {
            if (err) console.log(err);
            else {
                let str = `Flight ${statusSel.value}:`;
                let status = ev.returnValues['3'];

                switch (status) {
                    case 0:
                        str += " status is unknown.";
                        break;
                    case 10:
                        str += " on time.";
                        break;
                    case 20:
                        str += " delayed due to airline, respective insurees will be credited.";
                        amount = await flightSuretyApp.methods.getPendingWithdrawal().call({ from: await getMetaMaskID() });
                        amount = web3.utils.fromWei(amount.toString(), 'ether');
                        balance.innerText = `Your balance is ${amount} ether`;
                        break;
                    case 30:
                        str += " delayed due to weather.";
                        break;
                    case 40:
                        str += " delayed due to technical error.";
                        break;
                    case 50:
                        str += " status is other."
                        break;
                    default:
                        str += " incorrect status code.";
                        break;
                }

                DOM.elid("flight-stat-sec").appendChild(DOM.h5(str));
            }
        }
    );
})();


function display(title, description, content) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    content.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    });
    displayDiv.append(section);
}