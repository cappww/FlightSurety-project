import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';
const db = require('../server/db.json');


(async() => {

    let result = null;

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

    let contract = new Contract('localhost', () => {
        
        // Read transaction
        contract.isOperational((error, result) => {
            console.log("error: ", error, "result: ", result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        button.addEventListener('click', () => {
            //contract.
        })


    });
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







