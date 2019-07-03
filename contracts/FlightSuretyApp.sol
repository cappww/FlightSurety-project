pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./OracleManager.sol";

//FlightSurety Smart Contract

contract FlightSuretyApp is OracleManager {
    using SafeMath for uint256;

    address payable private contractOwner;          // Account used to deploy contract
    FlightSuretyData flightSuretyData;      // Instance of the data contract

    //CONSTRUCTOR
    constructor(address dataContract) public
    {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(dataContract);
    }

    function processFlightStatus
    (
        address airline,
        uint flight,
        uint256 timestamp,
        uint8 statusCode
    )
    internal
    {
        flightSuretyData.setFlightStatus(flight, timestamp, statusCode);
    }
}

//Contract Data Interface
contract FlightSuretyData {
    function setFlightStatus(uint, uint256, uint8) external;
}