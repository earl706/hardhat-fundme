const {ethers, deployments, getNamedAccounts} = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")
const {assert, expect} = require("chai")

!developmentChains.includes(network.name) ? decribe.skip : 
describe("FundMe", async function(){
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async function(){
        // const accounts = await ethers.getSigners()
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })

    describe("constructor", async function(){
        it("sets the aggregator addresses correctly", async function(){
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function(){
        it("Fails if you don't send enough ETH", async function(){
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })

        it("Updates the amount funded data structure", async function(){
            await fundMe.fund({value:sendValue})
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Adds funder to array of funders", async function(){
            await fundMe.fund({value:sendValue})
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
    })
    
    describe("withdraw", async function(){
        beforeEach(async function(){
            await fundMe.fund({value:sendValue})
        })

        it("Withdraw ETH from a single founder", async function(){
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const endingFundBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            
            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            assert.equal(endingFundBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })

        it("Allows us to withdraw with multiple funders", async function(){
            const accounts = await ethers.getSigners()
            for(let i=0;i<6;i++){
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({value:sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            
            const endingFundBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

            await expect(fundMe.funders(0)).to.be.reverted

            for(let i=1;i<6;i++){
                assert.equal(await fundMe.addressToAmountFunded(accounts[i].address),0)
            }

        })

        it("Only allows the owner to withdraw", async function(){
            const accounts = await ethers.getSigners()
            const attackerConnectedContract = await fundMe.connect(accounts[1])
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(attackerConnectedContract, "FundMe__NotOwner")
        })


        
    })
})



