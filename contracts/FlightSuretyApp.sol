pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

//FlightSurety Smart Contract

contract FlightSuretyApp {
    using SafeMath for uint256;

    address payable private contractOwner;          // Account used to deploy contract
    FlightSuretyData private flightSuretyData;      // Instance of the data contract
    address payable private contractAddress;

    //MODIFIERS
    modifier requireIsOperational()
    {
        // Modify to call data contract's status
        require(flightSuretyData.isOperational(), "Contract is currently not operational");
        _;
    }

    //CONSTRUCTOR

    /**
    * @dev Contract constructor
    *
    */
    constructor(address dataContract) public
    {
        contractOwner = msg.sender;
        contractAddress = address(uint160(address(this)));
        flightSuretyData = FlightSuretyData(dataContract);
        flightSuretyData.registerAirline(address(0x01839bE1cCA5D19F223Aa3eFD6794Ec4ddb02e18));
    }

    function isOperational() external pure returns(bool)
    {
        return true;
    }


    /*
     * Airline Section
    */

    struct Vote {
        mapping(address => bool) memberVoted;
        uint votes;
    }
    mapping(address => Vote) elections;

    event AirlineAdded(address airline);
    event MemberVoted(address member, uint votes);

    modifier requireRegisteredAirline()
    {
        require(flightSuretyData.isAirlineRegistered(msg.sender), "This address must be a registered airline to call this function");
        _;
    }

    modifier requireAmount()
    {
        require(msg.value >= 10 ether, "You have not given the correct amount of 10 ether");
        _;
    }

    modifier requireMemberAirline()
    {
        require(flightSuretyData.isAntePaid(msg.sender), "This airline has not paid the Ante yet");
        _;
    }

    function isAirlineRegistered(address airline)
        external
        view
        returns(bool)
    {
        return flightSuretyData.isAirlineRegistered(airline);
    }

    function payAnte()
        external
        payable
        requireIsOperational
        requireRegisteredAirline
        requireAmount
    {
        contractOwner.transfer(msg.value);
        flightSuretyData.payAnte(msg.sender);
    }

    function registerAirline(address newAirline)
        external
        requireMemberAirline
        returns(bool success, uint256 votes)
    {
        if(flightSuretyData.getAirlineCount() < 4) {
            flightSuretyData.registerAirline(newAirline);
            emit AirlineAdded(newAirline);
            return (true, 1);
        }
        if(elections[newAirline].memberVoted[msg.sender]){
            return (false, elections[newAirline].votes);
        } else {
            elections[newAirline].votes++;
            elections[newAirline].memberVoted[msg.sender] = true;
            uint airlineCount = flightSuretyData.getAirlineCount();
            if(elections[newAirline].votes >= airlineCount/2) {
                flightSuretyData.registerAirline(newAirline);
                emit AirlineAdded(newAirline);
                return (true, elections[newAirline].votes);
            } else {
                return (false, elections[newAirline].votes);
            }

        }
    }

    function registerFlight(uint flight) external requireMemberAirline
    {
        flightSuretyData.registerFlight(flight);
    }



    /*
     *  Passenger Section
    */

    function buyInsurance(uint flightNum)
        external
        payable
        requireIsOperational
    {
        require(msg.value <= 1 ether, "You cannot insure more than 1 ether");
        contractOwner.transfer(msg.value);
        flightSuretyData.buyInsurance(flightNum, msg.sender, msg.value);
    }

    function creditInsurees(uint flightNum) internal
    {
        address[] memory passengers = flightSuretyData.getFlightPassengers(flightNum);
        for (uint i = 0; i < passengers.length; i++) {
            flightSuretyData.creditInsuree(flightNum, passengers[i]);
        }
    }

    function withdrawCredit() public
    {
        require(getPendingWithdrawal() > 0, "You must have a balance greater than 0");
        uint amount = flightSuretyData.withdrawCredit(msg.sender);
        msg.sender.transfer(amount);
    }

    function getFlightInfo(uint flightNum)
        public
        view
        returns(bool, uint8, uint256, address, address[] memory)
    {
        return flightSuretyData.getFlightInfo(flightNum);
    }

    function getPendingWithdrawal()
        public
        view
        returns(uint)
    {
        return flightSuretyData.getPendingWithdrawal(msg.sender);
    }


    /*
     *  Oracle Section
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
    function registerOracle()
        external
        payable
        requireIsOperational
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
        creditInsurees(flight);
    }

    function getRandomIndex
    (
        address account
    )
        public
        returns (uint8)
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
    function isOperational() external view returns(bool);
    //Airline Functions
    function registerAirline(address) external;
    function payAnte(address) external;
    function isAirlineRegistered(address) external view returns(bool);
    function isAntePaid(address) external view returns(bool);
    function getAirlineCount() external view returns(uint);
    function registerFlight(uint) external;
    //Passenger
    function buyInsurance(uint, address, uint) external;
    function getFlightInfo(uint) public view returns(bool, uint8, uint256, address, address[] memory);
    function getFlightPassengers(uint) public view returns(address[] memory);
    function creditInsuree(uint, address) external;
    function withdrawCredit(address) external returns(uint);
    function setFlightStatus(uint, uint256, uint8) external;
    function getPendingWithdrawal(address) public view returns(uint);
}