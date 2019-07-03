import DOM from './dom';
import './flightsurety.css';
const db = require('../server/db.json');

const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
const Config = require('./config.json');
const Web3 = require('web3');


(async() => {

    let config = Config['localhost'];
    let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
    const flightSuretyApp = web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

    let selector = DOM.elid("flight-selector");
    let section = DOM.section();
    section.appendChild(DOM.h2("Select Flight"));
    let select = DOM.select();
    db.flights.forEach(flight => {
        select.appendChild(DOM.option(flight));
    });
    section.append(select);
    let button = DOM.button("Insure Flight for 1 ether");
    section.append(button);
    selector.append(section);

    let passenger = '0x667F2761d1030c473729fAe340C2A343663c2459';

    //console.log(flightSuretyApp.methods.isOperational())
    let isOperational = await flightSuretyApp.methods.isOperational().call({from: passenger});
    console.log("isOperational:" , isOperational);
    display('Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', value: isOperational}]);

    DOM.elid('submit-oracle').addEventListener('click', () => {
        let flight = DOM.elid('flight-number').value;
        // Write transaction

        console.log("clicked!!");
        //TODO: Call fetch flight status
    })

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}