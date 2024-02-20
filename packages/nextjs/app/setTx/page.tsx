"use client";

import * as React from "react";
import { parseEther } from "viem";
import { useContractWrite } from "wagmi";
import DeployedContracts from "~~/contracts/deployedContracts";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { NextPage } from "next";
import { AddressInput } from "~~/components/scaffold-eth";
import { IntegerInput } from "~~/components/scaffold-eth";
import { InputBase } from "~~/components/scaffold-eth";

const ContractInteraction = (value:string, argTx: readonly [string,bigint,bigint,string,string,string, readonly [string, string]]) => {
  const { writeAsync, isLoading } = useContractWrite({
    address: DeployedContracts[11155111].FundManager.address,
    abi: DeployedContracts[11155111].FundManager.abi,
    functionName: "setTx",
    value: parseEther(value),
    args: argTx,
  });

  const writeTx = useTransactor();

  return (
    <button onClick={() => writeTx(writeAsync, { blockConfirmations: 1 })} disabled={isLoading}>
      {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <span className="font-bold text-xl rounded-xl text-white bg-blue-300 bg-cover">&nbsp; Send &nbsp;</span>}
    </button>
  );
};

function fetchABI(add: string) {
    let viewArray: abiRead = {array: [], index: []};
    let js = fetch(`https://abidata.net/${add}?network=sepolia`)
    .catch((err)=>{console.log(err); return ""})
    .then(function(response: any) {
    try {return response.json();
    } catch (error) {console.log(error);
    }});
    let arr = js
    .then(function(data:any) {
        let abi = data.abi;
        for(let i = 0; i< abi.length; i++){
            if(abi[i].stateMutability == "view"){
                viewArray.array.push(abi[i].name + "(" + abi[i].inputs + ")");
                viewArray.index.push(i);
            }
        }
        return viewArray;
    })
    .catch((err)=>{console.log(err);})
    return arr;
}

export type abiRead = {
    array: string[],
    index: number[]
}

const setTx: NextPage = () => {
    
    const [addressToTime, setAddressToTime] = React.useState("");
    const [txValueTime, setTxValueTime] = React.useState<string | bigint>("");
    const [time, setTime] = React.useState<string | bigint>("");
    const [addressToCQ, setAddressToCQ] = React.useState("");
    const [txValueCQ, setTxValueCQ] = React.useState<string | bigint>("");
    const [addressSC, setAddressSC] = React.useState("");
    const [dataABI, setDataABI] = React.useState(Array<string>);
    const [indexABI, setIndexABI] = React.useState(Array<number>);
    const [expected, setExpected] = React.useState("");
    const [selectorValue, setSelectorValue] = React.useState("");
    const [abiIndex, setAbiIndex] = React.useState(0);


    const setTypeArgs = (str: string)=>{
        if(str == "string"){return "1"}
        else if(str == "uint"){return "2"}
        else{return "0"}
    }
    
    const handleChange = (e:any, ) => {
        setSelectorValue(e.target.value);
    };
    const handleChangeABI = (e:any) =>{
        setAbiIndex(e.target.value);
    }
    
    React.useEffect(() =>{
        fetchABI(addressSC)
        .then((response:any) => {
            setDataABI(response.array);
            setIndexABI(response.index);})
        .catch(()=>{});
        },[addressSC]);

    return(
        <div className="flex flex-col justify-center pt-10">
            <div className="flex w-full items-center">
                <div className="flex w-1/5"></div>
                <div className="flex-1 flex-col w-3/5 items-stretch items-center">
                    <div className="flex">
                        <div className="font-bold text-xl rounded-xl text-white bg-blue-300 bg-cover shadow-2xl">&nbsp; Time Trigger &nbsp;</div>
                    </div>
                    <div className="flex-col rounded-xl shadow-2xl p-5">
                        <IntegerInput disableMultiplyBy1e18={true} value={txValueTime} onChange={updatedTxValue => {setTxValueTime(updatedTxValue)}}
                            placeholder="Transaction Value (ETH)"
                        />
                        <AddressInput onChange={setAddressToTime} value={addressToTime} placeholder="Recipient" />
                        <IntegerInput disableMultiplyBy1e18={true} value={time} onChange={updatedTxValue => {setTime(updatedTxValue)}}
                            placeholder="Set Time delay (s)"
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center w-1/10">
                            {ContractInteraction(txValueTime.toString(),[addressToTime,BigInt(0),BigInt(time),addressToTime,"0","0",["string",""]])}
                    </div>
                    
                </div>
                <div className="flex w-1/5"></div>
            </div>
            <div className="flex w-full items-center">
                <div className="flex w-1/5"></div>
                <div className="flex-1 flex-col w-3/5 items-stretch items-center">
                    <div className="flex">
                        <div className="font-bold text-xl rounded-xl text-white bg-blue-300 bg-cover shadow-2xl">&nbsp; On-chain Trigger &nbsp;</div>
                    </div>
                    <div className="flex-col rounded-xl shadow-2xl p-5">
                        <IntegerInput value={txValueCQ} onChange={updatedTxValue => {setTxValueCQ(updatedTxValue)}}
                            placeholder="Transaction Value (ETH)"
                        />
                        <AddressInput onChange={setAddressToCQ} value={addressToCQ} placeholder="Recipient" />
                        <AddressInput onChange={setAddressSC} value={addressSC} placeholder="SmartContract of Trigger Variable" />
                        <div>
                            <div>
                                <select defaultValue={String(indexABI)} onChange={handleChangeABI}>
                                {dataABI?.map((x,id)=>(<option value={indexABI?.at(id)}>{x}</option>))}
                                </select>
                                <select defaultValue={selectorValue} onChange={handleChange}>
                                    <option>Select Arg Type</option>
                                    <option value={"string"} key={"1"}>String Input</option>
                                    <option value={"uint"} key={"2"}>Number Input</option>
                                    <option value={"address"} key={"0"}>Address Input</option>
                                </select>
                            </div>
                            <div>
                                <InputBase name="Expected Input" placeholder="Expected Input" value={expected} onChange={setExpected} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-1/10">
                            {ContractInteraction(txValueCQ.toString(),[addressToCQ,BigInt(1),BigInt(1),addressSC,String(abiIndex),expected,[selectorValue,expected]])}
                    </div>
                    
                </div>
                <div className="flex w-1/5"></div>
            </div>
        </div>
        
    )
}

export default setTx;