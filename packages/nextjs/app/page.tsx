"use client";

import type { NextPage } from "next";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");
  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
  });
  const tx = async () => {
    try {
      await writeYourContractAsync({
        functionName: "setGreeting",
        args: ["embedded wallet value test completed"],
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  return (
    <div>
      <button className="btn btn-primary" onClick={tx}>
        Set Greeting
      </button>
      <p>{greeting}</p>
    </div>
  );
};

export default Home;
