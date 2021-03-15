# Nifty Gallery

A simple gallery style browser-based NFT viewer for displaying on a TV or tablet.

Enter a wallet address and it will automatically pull in all ERC-721 balances and their metadata. Relies on Metamask, Etherscan, and OpenSea

### Dependencies

This applicaiton has the following dependencies:

* Metamask
  * Used to connect to the Ethereum network to query token contracts
* Etherscan API
  * Used to query wallet address for ERC-721 transactions
  * Used to get a contracts ABI
* Ethers.js
  * Used to query contracts to verify token ownership
* OpenSea
  * API is used to get tokens name and traits
  * Image CDN is used to resolve token URIs

### Credits

[@econoar for this original inspiration and idea](https://twitter.com/econoar/status/1371259652025946115)

[chris22smith on Codepen for the original frame CSS](https://codepen.io/chris22smith/pen/PbBwjp)

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```
