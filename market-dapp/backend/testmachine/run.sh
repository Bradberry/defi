#!/bin/bash

# general definitions
FULL_PATH=$(dirname $(realpath $0))
BASE_DIR=$(dirname $FULL_PATH)
IPFS_PATH='/ipfs/QmfM8ipwA8Ja2PmJwzLSdGdYRYtZmRMQB8TDZrgM1wYWBk'
LOGGER_ROOT_HASH='878c868df0c867cff5ad4fc7750600bb59981dcc6c3cf77c1e0447cb507b7812'
NETWORK="rinkeby"
PROJECT_ID="ddb36eb8e9764d569e3a3985f0403345"

# set base descartes directory to specified path if provided
if [ $1 ]; then
  BASE_DIR=$1
fi

# Build the cartesi machine 
. $FULL_PATH/build-cartesi-machine.sh $BASE_DIR/machines

export IPFS_PATH
export LOGGER_ROOT_HASH
export NETWORK
export PROJECT_ID

npx hardhat run $BASE_DIR/deploy/01_contracts.ts --network $NETWORK

# Instantiate descartes and start the process
npx hardhat run $FULL_PATH/instantiate.ts --no-compile --network $NETWORK
