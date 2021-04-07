import React from 'react';
import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle } from "@drizzle/store";
import STMarketplace from "./STMarketplace.json";
import SimthunderOwner from "./SimthunderOwner.json"
import RouterPage from "./pages/RouterPage";
import Web3 from "web3";

var web3 = new Web3(Web3.givenProvider);

const drizzleOptions = {
  contracts: [
    {
      contractName: "STMarketplace",
      web3Contract: new web3.eth.Contract(STMarketplace.abi, STMarketplace.address, {data: STMarketplace.deployedBytecode })
    },
    {
      contractName: "SimthunderOwner",
      web3Contract: new web3.eth.Contract(SimthunderOwner.abi, SimthunderOwner.address, {data: SimthunderOwner.deployedBytecode })
    } 
  ]
};

const drizzle = new Drizzle(drizzleOptions);

class App extends React.Component {

  render() {
    return (
      <DrizzleContext.Provider drizzle={drizzle}>
        <DrizzleContext.Consumer>
          {drizzleContext => {
            const { drizzle, drizzleState, initialized } = drizzleContext;

            if (!initialized) {
              return "Loading..."
            }

            return (
              <RouterPage drizzle={drizzle} drizzleState={drizzleState} />
            )
          }}
        </DrizzleContext.Consumer>
      </DrizzleContext.Provider>
    );
  }

}

export default App;
