const {getNamedAccounts, ethers} = require("hardhat")


async function main(){
    const {deployer} = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)

    console.log("funding Contract...")

    const transactionResponse = await fundMe.fund({value:ethers.utils.parseEther('0.1')})

    const transactionReceipt = await transactionResponse.wait(1)

    console.log("Funded")
}


main()
.then( process.exit(0))
.catch((e)=>{
    console.log(e)
    process.exit(1)
})