pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

//FlightSurety Smart Contract

contract FlightSuretyApp {
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

    function buyInsurance(uint flightNum) external payable
    {
        require(msg.value <= 1 ether, "You cannot insure more than 1 ether");
        contractOwner.transfer(msg.value);
        flightSuretyData.buyInsurance(flightNum, msg.sender, msg.value);
    }

    function creditInsurees(uint flightNum) external
    {
        address[] memory passengers = flightSuretyData.getFlightPassengers(flightNum);
        for (uint i = 0; i < passengers.length; i++) {
            flightSuretyData.creditInsuree(flightNum, passengers[i]);
        }
    }

    function withdrawCredit() public
    {
        uint amount = flightSuretyData.withdrawCredit(msg.sender);
        msg.sender.transfer(amount);
    }

    function() external payable {}

}

//Contract Data Interface
contract FlightSuretyData {
    function buyInsurance(uint, address, uint) external;
    function getFlightInfo(uint) public view returns(bool, uint8, uint256, address, address[] memory);
    function getFlightPassengers(uint) public view returns(address[] memory);
    function creditInsuree(uint, address) external;
    function withdrawCredit(address sender) external returns(uint);
}