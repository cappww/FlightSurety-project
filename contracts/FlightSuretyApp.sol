pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

//FlightSurety Smart Contract

contract FlightSuretyApp {
    using SafeMath for uint256;

    address payable private contractOwner;          // Account used to deploy contract
    FlightSuretyData private flightSuretyData;      // Instance of the data contract

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

    function isOperational() external pure returns(bool)
    {
        return true;
    }


    /*
     *  Passenger Functions
    */

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

    function getFlightInfo(uint flightNum) public view returns(bool, uint8, uint256, address, address[] memory)
    {
        return flightSuretyData.getFlightInfo(flightNum);
    }



    /*
     *  Oracle Functions
    */

    uint256 public constant REGISTRATION_FEE = 1 ether;
    uint256 private constant MIN_RESPONSES = 3;
    uint8 private nonce = 0;
    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;
        bool isOpen;
        mapping(uint8 => address[]) responses;
    }
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    //EVENTS
    event OracleRequest(uint8 index, address airline, uint flight, uint256 timestamp);
    event OracleReport(address airline, uint flight, uint256 timestamp, uint8 status);
    event FlightStatusInfo(address airline, uint flight, uint256 timestamp, uint8 status);

    function generateIndexes
    (
        address account
    )
    internal returns(uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }


    // Register an oracle with the contract
    function registerOracle() external payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
            isRegistered: true,
            indexes: indexes
        });
    }

    function getMyIndexes() external view returns(uint8[3] memory)
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");
        return oracles[msg.sender].indexes;
    }

    function fetchFlightStatus
    (
        address airline,
        uint flightNum,
        uint timestamp
    )
        external returns(address)
    {
        uint8 index = getRandomIndex(msg.sender);
        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flightNum, timestamp));
        oracleResponses[key] = ResponseInfo({
            requester: msg.sender,
            isOpen: true
        });
        emit OracleRequest(index, airline, flightNum, timestamp);
        return msg.sender;
    }

    function submitOracleResponse
    (
        uint8 index,
        address airline,
        uint flight,
        uint256 timestamp,
        uint8 statusCode
    )
    external returns (uint)
    {
        require(
            (oracles[msg.sender].indexes[0] == index) ||
            (oracles[msg.sender].indexes[1] == index) ||
            (oracles[msg.sender].indexes[2] == index),
            "Index does not match oracle request"
        );
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");
        oracleResponses[key].responses[statusCode].push(msg.sender);
        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length == MIN_RESPONSES) {
            emit FlightStatusInfo(airline, flight, timestamp, statusCode);
            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }

    function processFlightStatus
    (
        address airline,
        uint flight,
        uint256 timestamp,
        uint8 statusCode
    ) internal
    {
        flightSuretyData.setFlightStatus(flight, timestamp, statusCode);
        //creditInsurees(flight);
    }

    function getRandomIndex
    (
        address account
    )
    public returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

}

//Contract Data Interface
contract FlightSuretyData {
    function buyInsurance(uint, address, uint) external;
    function getFlightInfo(uint) public view returns(bool, uint8, uint256, address, address[] memory);
    function getFlightPassengers(uint) public view returns(address[] memory);
    function creditInsuree(uint, address) external;
    function withdrawCredit(address) external returns(uint);
    function setFlightStatus(uint, uint256, uint8) external;
}