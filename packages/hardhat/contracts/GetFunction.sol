// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract GetFunction is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Custom error type
    error UnexpectedRequestID(bytes32 requestId);

    // Event to log responses
    event Response(
        bytes32 indexed requestId,
        string answer,
        bytes response,
        bytes err
    );

    // Hardcoded for Sepolia
    // Supported networks https://docs.chain.link/chainlink-functions/supported-networks
    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 donID =
        0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    //Callback gas limit
    uint32 gasLimit = 300000;

    // Your subscription ID.
    uint64 public s_subscriptionId;

    // JavaScript source code    
    string public source =
        "const _address = args[0];"
        "const _index = args[1];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://abidata.net/${_address}?network=sepolia`,"
        "});"
        "if (apiResponse.error) {"
        "throw Error('Request failed');"
        "}"
        "const { data } = apiResponse;"
        "const funData = data[\"abi\"][_index];"
        "const funName = funData[\"name\"];"
        "let funInp = \"\";"
        "for(let i = 0; i < funData[\"inputs\"].length; i++ ){"
            "funInp = funInp + funData[\"inputs\"][i][\"type\"] + \",\";"
        "}"
        "funInp = funInp.slice(0,funInp.length-1);"
        "funInp = \"(\" + funInp + \")\";"
        "return Functions.encodeString(funName+funInp);";
   
    string public _answer;

    constructor(uint64 subscriptionId) FunctionsClient(router) {
        s_subscriptionId = subscriptionId;
    }

    function getFun(
        string memory _address, string memory _index
    ) external returns (bytes32 requestId) {

        string[] memory args = new string[](2);
        args[0] = _address;
        args[1] = _index;

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source); // Initialize the request with JS code
        if (args.length > 0) req.setArgs(args); // Set the arguments for the request

        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            s_subscriptionId,
            gasLimit,
            donID
        );

        return s_lastRequestId;
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }        
        s_lastError = err;

        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        _answer = string(response);

        // Emit an event to log the response
        emit Response(requestId, _answer, s_lastResponse, s_lastError);
    }
}
