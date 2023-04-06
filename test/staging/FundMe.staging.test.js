const { getNamedAccounts, network, ethers } = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")

developmentChains.includes(network.name) ? decribe.skip : 
describe("fundMe", async function(){
    let fundMe
    let deployer
    const sendValue = ethers.utils.parseEther('1')
    beforeEach(async function(){
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("fundMe", deployer)

        it("allows people to fund and withdraw", async function(){
            await fundMe.fund({value:sendValue})
            await fundMe.withdraw()

            const endingBalance = await fundMe.provide.getBalance(
                fundMe.address
            )

            assert.equal(endingBalance.toString(), 0)
        })
    })  
})