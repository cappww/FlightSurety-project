pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    //DATA VARIABLES
    bool private operational;
    address private contractOwner;
    address private authorizedCaller;

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

    //MODIFIERS
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAuthorizedCaller()
    {
        require(msg.sender == authorizedCaller, "This caller is not authorized");
        _;
    }

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public
    {
        contractOwner = msg.sender;
        operational = true;
        authorizedCaller = address(0);
    }

    function isOperational() external view returns(bool)
    {
        return operational;
    }

    function setOperatingStatus(bool mode) external requireContractOwner
    {
        operational = mode;
    }

    function authorizeCaller(address caller) external
    {
        require(msg.sender == contractOwner, "Only the contract owner can call this function");
        authorizedCaller = caller;
    }

    /*
     * Airline Section
    */

    mapping(address => bool) private registeredAirlines;
    mapping(address => bool) private memberAirlines; //Airlines that are registered and paid ante
    uint private airlineCount;

    function registerAirline(address newAirline) external
    {
        registeredAirlines[newAirline] = true;
        airlineCount++;
    }

    function payAnte(address newAirline) external
    {
        memberAirlines[newAirline] = true;
    }

    function isAirlineRegistered(address airline) external view returns(bool)
    {
        return registeredAirlines[airline];
    }

    function isAntePaid(address airline) external view returns(bool)
    {
        require(registeredAirlines[airline], "This address is not a registered airline");
        return memberAirlines[airline];
    }

    function getAirlineCount() external view returns(uint)
    {
        return airlineCount;
    }

    function setFlightStatus(uint flight, uint256 timestamp, uint8 status) external
    {
        flights[flight].updatedTimestamp = timestamp;
        flights[flight].statusCode = status;
    }

    function registerFlight(uint flightNum) external
    {
        flights[flightNum] = Flight(true, 0, now, msg.sender, new address[](0));
    }

    /*
     * Passenger Section
    */

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

