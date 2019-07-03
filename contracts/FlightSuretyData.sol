pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    //DATA VARIABLES
    address private contractOwner;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
        address[] insuredPassengers;
        mapping(address => uint) amountsInsured;
    }
    mapping(uint => Flight) private flights;
    mapping(address => uint) pendingWithdrawals;

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public
    {
        contractOwner = msg.sender;
        //operational = true;
        flights[1001] = Flight(true, 10, now, contractOwner, new address[](0));
    }

    function setFlightStatus(uint flight, uint256 timestamp, uint8 status) external
    {
        flights[flight].updatedTimestamp = timestamp;
        flights[flight].statusCode = status;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buyInsurance(uint flightNum, address sender, uint amount) external payable
    {
        flights[flightNum].insuredPassengers.push(sender);
        flights[flightNum].amountsInsured[sender] = amount;
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsuree(uint flightNum, address passenger) external
    {
        uint amount = flights[flightNum].amountsInsured[passenger];
        flights[flightNum].amountsInsured[passenger] = 0;
        pendingWithdrawals[passenger] = (amount + amount/2);
    }

    function getFlightInfo(uint flightNum) public view returns(bool, uint8, uint256, address, address[] memory){
        return (
            flights[flightNum].isRegistered,
            flights[flightNum].statusCode,
            flights[flightNum].updatedTimestamp,
            flights[flightNum].airline,
            flights[flightNum].insuredPassengers
        );
    }

    function getFlightPassengers(uint flightNum) public view returns(address[] memory)
    {
        return flights[flightNum].insuredPassengers;
    }

    function getAmountInfo(uint flightNum, address passenger) public view returns(uint)
    {
        return flights[flightNum].amountsInsured[passenger];
    }

    function getPendingWithdrawal(address passenger) public view returns(uint)
    {
        return pendingWithdrawals[passenger];
    }

    function withdrawCredit(address sender) external returns(uint)
    {
        uint amount = pendingWithdrawals[sender];
        pendingWithdrawals[sender] = 0;
        return amount;
    }
}

