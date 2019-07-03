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
}

//Contract Data Interface
contract FlightSuretyData {
}