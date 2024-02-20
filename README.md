# Switch: My BuidlGuidl #1 Project Submition
Switch is a basic dapp for scheduling transactions on Sepolia. My Final project for BuidlGuidl #1 🔮

## Description 📰

Switch is a web app for sending defferred transactions. The user has a simple UI for setting a transaction which will be triggered and excecuted later. It implements **Scaffold-Eth 2** and also Chainlink Functions and Automation. 
The transactions can be triggered by:
  - Time 🕐. (After a specified time amount)
  - On-chain data 📶 (The user selects a *verified* Smart Contract and points to a variable / method whose return is compared with an expected result. When return and expected result match, the transaction is sent 🚀).

## Disclaimer ⚠️

The project was done in a weekend, so of course (*as of today*) it lacks some features. I will list some of the most important ones for future upgrades:
- Cannot fund chainlink functions and automation accounts through the smart contract.
- When selecting an On-chain method Trigger, currently the Smart Contract deployed cannot implement methods with more than 2 arguments
- Chainlink Functions updates on-chain triggers every 60 seconds. This could be costumizable.
- Some general UI upgrade... 😅



