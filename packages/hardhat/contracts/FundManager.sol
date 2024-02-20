//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./GetFunction.sol";

enum status {PENDING, TRANSFERRED, PROCESSING}

struct txForm {
    //Form to keep registry of logged transactions.
    uint256 index; //Keep transaction indexed
    address addressFrom;
    address payable addressTo;
    uint256 timestamp;
    uint256 txValue;
    status _status;
    uint256 selector; //For selecting trigger
    uint256 intervalTT; //For Time Trigger
    address addCQ;      //For Contract Query
    string indexCQ;    //For Contract Query
    string expectedCQ;  //For Contract Query
    string argSTR;    //For Contract Query
    address argAD;    //For Contract Query
    uint256  argINT;     //For Contract Query
    uint256 argType;
}

struct RequestStatus {
    bool fulfilled; // whether the request has been successfully fulfilled
    bool exists; // whether a requestId exists
    bytes response;
    bytes err;
}


contract FundManager is AutomationCompatibleInterface{

    GetFunction public getFunction;

    // Events for logging and excecuting scheduled transactions.    
    event Transaction(address addressFrom, address addressTo, uint256 amonut);
    event AppendTxForm(txForm appended);
    event UpdateTxForm(txForm updated);
    event LogBytes(bytes log);
    event LogString(string log);
    //uint256 private gasBalance;
    
    //Variables for keeping track of scheduled transactions.
    bool public answering;
    status[] pendingTxIndex;
    txForm[] private txLogHistory;
    txForm[] private txLogTransferred;
    mapping(uint256 => uint256) public lastQuery;
    uint256 public lastIndex;

    constructor(address _gFaddress){
        getFunction = GetFunction(_gFaddress);
    }

    //For testing
    function returnBalance(address _add) public view returns(uint256){
        return _add.balance;
    }
    //For testing
    function createForm(address _addFrom, address payable _addTo, address _addCQ, string memory _indexCQ) public view returns(txForm memory){
        txForm memory newTx;
        newTx.addCQ = _addCQ;
        newTx.indexCQ = _indexCQ;
        newTx.intervalTT = 5*60;
        newTx.selector = 0;
        newTx._status = status.PENDING;
        newTx.addressFrom = _addFrom;
        newTx.addressTo = _addTo;
        newTx.index = 0;
        newTx.timestamp = block.timestamp;
        newTx.txValue = 10**18;
        newTx.expectedCQ = "Hello World!";
        return newTx;
    }

/*
    //Needs implementation for funding Link.
*/
    function getAllForms() public view returns(txForm[] memory){
        return txLogHistory;
    }
    //View a Log from an Index.
    function getForm(uint256 index) public view returns(txForm memory) {
        return txLogHistory[index];
    }

/*
    //Needs implementation for seeing remaning Link funding.
*/
    function getLockedTxValue() public view returns(uint256){
        uint256 sum = 0;
        if(pendingTxIndex.length > 0){
            for(uint256 i = 0; i< txLogHistory.length; i++){
                if(pendingTxIndex[i] == status.PENDING){
                    uint256 value = txLogHistory[i].txValue;
                    sum += value;
                }
            }
        }
        return sum;
    }

    function setTx(
        address payable addressTo, uint256 _selector, uint256 _intervalTT, 
        address _addCQ, string memory _indexCQ, string calldata _expected,
        string[2] calldata _args
        ) public payable{
        //Funds and logs tx.
        //Then it calls automation function.
        (bool txSuccess, ) = address(this).call{value: msg.value}("");
        require(txSuccess,"Transaction Failed");
        emit Transaction(msg.sender, address(this), msg.value);
        txForm memory _txForm;
        _txForm.index = txLogHistory.length;
        _txForm._status = status.PENDING;
        _txForm.addressFrom = msg.sender;
        _txForm.addressTo = addressTo;
        _txForm.timestamp = block.timestamp;
        lastQuery[_txForm.index] = block.timestamp;
        _txForm.txValue = msg.value;
        _txForm.selector = _selector;
        _txForm.intervalTT = _intervalTT;
        _txForm.addCQ = _addCQ;
        _txForm.indexCQ = _indexCQ;
        _txForm.expectedCQ = _expected;
        txLogHistory.push(_txForm);
        getArgsAdd(_args, _txForm.index);
        lastIndex = _txForm.index;
        emit AppendTxForm(_txForm);
        pendingTxIndex.push(status.PENDING);
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData){
        status[] memory auxPending = pendingTxIndex;
        bool result = false;
        for(uint256 i = 0; i< pendingTxIndex.length; i++){
            if(pendingTxIndex[i]==status.PENDING){
                if(txLogHistory[i].selector == 0){
                    //Time trigger
                    result = checkTimeTrigger(txLogHistory[i].intervalTT, txLogHistory[i]);
                }
                else if(txLogHistory[i].selector == 1){
                    //Onchain value trigger
                    result = (block.timestamp - lastQuery[i] > 60);
                }
                if(result){
                    upkeepNeeded = true;
                    auxPending[i] = status.PROCESSING;
                }
            }
        }
        performData = abi.encode(auxPending);
    }

    function performUpkeep(bytes calldata performData) external override {
        (status[] memory auxPending) = abi.decode(performData,(status[]));
        for(uint256 i = 0; i < auxPending.length; i++){
            if(auxPending[i] == status.PROCESSING){
                if(txLogHistory[i].selector == 0){
                    makeTx(txLogHistory[i]);
                } else if(txLogHistory[i].selector == 1){
                    bool doTx = checkABItrigger(i);
                    if(doTx){makeTx(txLogHistory[i]);}
                    else {lastQuery[i] = block.timestamp;}
                }
            }
        }
    }

    function checkABItrigger(uint256 i) public returns(bool result){
        string memory addressCQ = Strings.toHexString(uint256(uint160(txLogHistory[i].addCQ)), 20);
        getFunction.getFun(addressCQ, txLogHistory[i].indexCQ);
        string memory answer = getFunction._answer();
        string memory answerToCall = getValueFromABI(txLogHistory[i].addCQ, txLogHistory[i], answer);
        result = Strings.equal(answerToCall, txLogHistory[i].expectedCQ);        
    }

    function checkTimeTrigger(uint256 interval, txForm memory _txForm) public view returns(bool) {
        uint256 iniTime = _txForm.timestamp;
        return (interval < block.timestamp - iniTime);
    }

    function getValueFromABI(address _add, txForm memory _txForm, string memory _fun) public payable returns(string memory returnCall){
        bytes memory data;
        _add = address(_add);
        if(_txForm.argType == 0){
            (, data) = _add.call{value: msg.value}(abi.encodeWithSignature(_fun,_txForm.argAD)); 
        } else if(_txForm.argType == 1){
            if(Strings.equal(_txForm.argSTR, "")){
                (, data) = _add.call{value: msg.value}(abi.encodeWithSignature(_fun));
            } else {
                (, data) = _add.call{value: msg.value}(abi.encodeWithSignature(_fun,_txForm.argSTR));
            }

        } else if(_txForm.argType == 2){
            if(_txForm.argINT == 0){
                (, data) = _add.call{value: msg.value}(abi.encodeWithSignature(_fun));
            } else {
                (, data) = _add.call{value: msg.value}(abi.encodeWithSignature(_fun,_txForm.argINT));
            }
        }
        returnCall =  abi.decode(data,(string));
        answering = Strings.equal(returnCall, _txForm.expectedCQ);
        return returnCall;
    }

    function makeTx(txForm memory _txForm) private {
        address payable _to = _txForm.addressTo;
        uint256 txValue = _txForm.txValue;
        uint256 index = _txForm.index;

        (bool success,) = _to.call{value: txValue}("");
        require(success, "Transaction Failed. Check Gas Tank.");
        emit Transaction(msg.sender, _to , txValue);
        txForm memory newTxLog = _txForm;
        newTxLog.timestamp = block.timestamp; 
        txLogTransferred.push(newTxLog);
        pendingTxIndex[index] = status.TRANSFERRED;
        txLogHistory[index]._status = status.TRANSFERRED;
        emit UpdateTxForm(txLogHistory[index]);
    }


    function getArgsAdd(string[2] calldata _args, uint256 _index) public {
        txForm storage _txForm = txLogHistory[_index];
        if(Strings.equal(_args[0], "address")){
            _txForm.argAD = address(bytes20(bytes(_args[1])));
            _txForm.argType = 0;
        } else if(Strings.equal(_args[0], "string")){
            _txForm.argSTR = _args[1];
            _txForm.argType = 1;
        } else if(Strings.equal(_args[0],"uint")){
            uint256 num = st2num(_args[1]);
            _txForm.argINT = num;
            _txForm.argType = 2;
        } else {revert();}
    }

    function st2num(string memory numString) public pure returns(uint) {
        uint  val=0;
        bytes   memory stringBytes = bytes(numString);
        for (uint  i =  0; i<stringBytes.length; i++) {
            uint exp = stringBytes.length - i;
            bytes1 ival = stringBytes[i];
            uint8 uval = uint8(ival);
           uint jval = uval - uint(0x30);
   
           val +=  (uint(jval) * (10**(exp-1))); 
        }
        return val;
    }

    receive() external payable {
    }

}