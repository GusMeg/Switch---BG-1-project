import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon, PowerIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-5">
        <div className="px-5">
          <h1 className="flex flex-row justify-center items-center gap-12 mb-8">
            <button>
              <PowerIcon className="h-20 w-20" color="black"/>
            </button>
            <span className="text-9xl font-bold">SWITCH</span>
          </h1>
          <p className="text-center text-2xl">
            <span className="rounded-xl text-white bg-blue-300 bg-cover font-bold">&nbsp; Flip the switch &nbsp;</span>{" "} and schedule your transactions.
          </p>
          <p className="text-center text-lg">
            Trigger transactions by time or by <span className="rounded-xl flex-1 text-white bg-blue-300 font-bold">&nbsp; on-chain &nbsp;</span>{" "} data
          </p>
          <p className="items-center text-center">
            <span className="rounded-xl text-white bg-blue-300 bg-cover font-bold tracking-wider">
            &nbsp; Connect your Wallet to Start &nbsp;
            </span>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8">
          <div className="flex justify-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col px-8 py-5 text-center items-center max-w-base rounded-3xl">
              <p className="text-xl font-bold">Built with 🏗 {" "}
                <Link href="https://github.com/scaffold-eth/se-2" passHref className="link">
                Scaffold-ETH 2
                </Link>
              </p>
              <Image src="/logoBG.svg" alt="BGlogo" width={400} height={400} className="w-full h-auto"/>
            </div>
            <div className="flex py-4 px-5 pt-10 justify-center text-center items-center max-w-xs rounded-3xl">
              <span className="text-base font-bold px-4 max-w-xs"> 
                Using Chainlink Automation and Functions
              </span>
              <Image src="/chainlink-link-logo.png" alt="" width={100} height={100} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
