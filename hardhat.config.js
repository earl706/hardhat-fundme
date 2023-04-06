const { version } = require("os");

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy")
require("dotenv").config()

const SEPOLIA_RPC_NETWORK = process.env.SEPOLIA_RPC_NETWORK
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {version:"0.8.8"},
      {version:"0.6.6"}
    ]
  },
  gasReporter:{
    enabled:false,
    outputFile:"gas-report.txt",
    noColors:true,
    currency:"USD",
    coinmarketcap:COINMARKETCAP_API_KEY,
    token:"MATIC"
  },
  defaultNetwork: "hardhat",
  etherscan:{
    apiKey:ETHERSCAN_API_KEY,
  },
  networks: {
    sepolia:{
      url: SEPOLIA_RPC_NETWORK,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations:6,
    }
    },
  namedAccounts: {
    deployer: {
      default:0,
    },
    }
  };
