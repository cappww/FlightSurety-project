pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract PassengerManager {
    using SafeMath for uint256;

    function getContractOwner() internal view returns(address payable);
    function getFlightSuretyData() internal view returns(FlightSuretyData);

    function buyInsurance(uint flightNum) external payable
    {
        require(msg.value <= 1 ether, "You cannot insure more than 1 ether");
        getContractOwner().transfer(msg.value);
        getFlightSuretyData().buyInsurance(flightNum, msg.sender, msg.value);
    }

    function creditInsurees(uint flightNum) external
    {
        address[] memory passengers = getFlightSuretyData().getFlightPassengers(flightNum);
        for (uint i = 0; i < passengers.length; i++) {
            getFlightSuretyData().creditInsuree(flightNum, passengers[i]);
        }
    }

    function withdrawCredit() public
    {
        uint amount = getFlightSuretyData().withdrawCredit(msg.sender);
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