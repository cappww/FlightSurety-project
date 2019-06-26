pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    //DATA VARIABLES
    address private contractOwner;
    bool private operational;  // Blocks all state changes throughout the contract if false
    mapping(address => bool) private registeredAirlines;
    mapping(address => bool) private memberAirlines; //Airlines that are registered and paid ante
    uint private airlineCount;

    mapping(string => address[]) InsureesFromFlight;

    //EVENT DEFINITIONS
    event AirlineAdded(address airline);

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public
    {
        contractOwner = msg.sender;
        operational = true;
    }

    //FUNCTION MODIFIERS
    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    //UTILITY FUNCTIONS

    /*
    function authorizeCaller(address caller) public pure returns(uint, address) {
        return (100, caller);
    }
    */

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational() external view returns(bool)
    {
        return operational;
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

    function getAirlineCount() external view returns(uint) {
        return airlineCount;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode) external requireContractOwner
    {
        operational = mode;
    }

    //SMART CONTRACT FUNCTIONS
   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address newAirline)
        external
    {
        registeredAirlines[newAirline] = true;
        airlineCount++;
    }

    function payAnte(address newAirline) external {
        memberAirlines[newAirline] = true;
    }


   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy(string calldata flight, address sender) external payable requireIsOperational
    {
        InsureesFromFlight[flight].push(sender);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees(string calldata flight) external view requireIsOperational returns(address[] memory)
    {
        return InsureesFromFlight[flight];
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay() external view requireIsOperational
    {
        0;
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund() public payable requireIsOperational
    {
    }

    function getFlightKey
    (
        address airline,
        string memory flight,
        uint256 timestamp
    )
    internal pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() external payable
    {
        fund();
    }


}

