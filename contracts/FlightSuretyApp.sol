pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PassengerManager.sol";

//FlightSurety Smart Contract

contract FlightSuretyApp is PassengerManager {
    using SafeMath for uint256;

    address payable private contractOwner;          // Account used to deploy contract
    FlightSuretyData flightSuretyData;      // Instance of the data contract

    //MODIFIERS

    //CONSTRUCTOR

    /**
    * @dev Contract constructor
    *
    */
    constructor(address dataContract) public
    {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(dataContract);
    }

    function getContractOwner() internal view returns(address payable)
    {
        return contractOwner;
    }

    function getFlightSuretyData() internal view returns(FlightSuretyData)
    {
        return flightSuretyData;
    }

}