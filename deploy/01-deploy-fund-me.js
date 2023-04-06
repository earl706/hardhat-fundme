const {networkConfig, developmentChains} = require("../helper-hardhat-config")
const {network} = require("hardhat")
const {verify} = require("../utils/verify")
require('dotenv').config()


module.exports = async ({deployments, getNamedAccounts}) => {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId

   
    let ethUsdIdPriceFeedAddress

    if(developmentChains.includes(network.name)){
        console.log("Local Network Detected! Deploying Fund Me...")
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdIdPriceFeedAddress = ethUsdAggregator.address
    }
    else {
        ethUsdIdPriceFeedAddress = networkConfig[chainId]["ethUsdId"]
    }
    
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args:[ethUsdIdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log(fundMe.address)
    const args = [ethUsdIdPriceFeedAddress]
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address, args)   
    }

    log("Fund Me Deployed!")
    log("-----------------------------------------------------------------")
}

module.exports.tags = ["all", "fund-me"]
