"use client";

import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

const Main: NextPage = () => {

    const { address: connectedAddress } = useAccount();
    const { data: txForms} = useScaffoldContractRead({
        contractName: "FundManager",
        functionName: "getAllForms",
        watch: true,
    });
    const { data: tVL, isLoading: isTVLloading } = useScaffoldContractRead({
        contractName: "FundManager",
        functionName: "getLockedTxValue",
        watch: true,
    });

    const getTVL = ()=>{
        return (
        <div className="flex flex-row">
            <div className="flex flex-col items-center">
                <span className="font-bold text-xl">Total value locked on:&nbsp;</span>
                <span>
                    <Address address="0x3ac8e8c48Cb3be938af6632d0dE2e52A343E6871"/>
                </span>
            </div>
            {tVL ? <div className="flex flex-row font-bold text-5xl">&nbsp;{(Number(tVL)/(10**18)).toString()} ETH</div> : <span className="flex flex-row font-bold text-5xl">&nbsp;0 ETH</span>} 
        </div>
        )
    }

    const getTxFromAddress = ()=>{    
            let auxArr;
            (txForms && connectedAddress) ? auxArr = txForms?.filter((x) =>{return x.addressFrom == connectedAddress}) : auxArr = [{index: 0, addressFrom: "Loading",txValue: 0,timestamp: 0,selector: 0,_status:0}];
            //let auxArr0 = auxArr?.at(0);
            return( 
                auxArr.map((auxArr0, id)=>(
                <tr key={Number(auxArr0?.index).toString()} className="text-sm text-center text-base-content">
                    <td className="w-1/12 md:py-4">
                        {Number(auxArr0?.index).toString()} 
                    </td>
                    <td className="w-1/12 md:py-4">
                        <Address address={auxArr0?.addressTo}/>
                    </td>
                    <td className="w-1/12 md:py-4">
                    {Number(auxArr0?.txValue)/(10**18)}
                    </td>
                    <td className="w-1/12 md:py-4">
                        {Number(auxArr0?.timestamp)}
                    </td>
                    <td className="w-1/12 md:py-4">
                        {Number(auxArr0?.selector) == 0 ? "Time" : "OnChain"}
                    </td>
                    <td className="w-1/12 md:py-4">
                        {auxArr0?._status == 0 ? "Pending" : (auxArr0?._status == 1 ? "Transferred" : "Processing")}
                    </td>
                </tr>
                )))        
    }

    return (
        <div className="flex flex-col justify-center px-4 md:px-0">
            <div className="flex flex-col items-center py-10">
                {getTVL()}
            </div>
            <div className="overflow-x-auto w-full shadow-2xl rounded-xl">
              <table className="table text-xl bg-base-100 table-zebra w-full md:table-md table-sm">
                    <thead>
                        <tr className="rounded-xl text-sm text-base-content">
                            <th className="bg-primary text-center"> # </th>
                            <th className="bg-primary text-center"> Address To </th>
                            <th className="bg-primary text-center"> ETH amount </th>
                            <th className="bg-primary text-center"> Created on </th>
                            <th className="bg-primary text-center"> Trigger Type </th>
                            <th className="bg-primary text-center"> Status </th>
                        </tr>
                    </thead>
                    <tbody>
                        {getTxFromAddress()}
                    </tbody>
                </table>
            </div>
        </div>
    )
};
export default Main;