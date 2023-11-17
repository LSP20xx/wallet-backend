// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./WalletContract.sol";

contract GeneratorFactoryContract {
  address private immutable owner;
  event WalletGenerated(address indexed wallet);

  constructor() {
    owner = msg.sender;
  }

  function generateWallet() external {
    require(msg.sender == owner, "Only the owner can generate wallets");
    address wallet = address(new WalletContract());
    emit WalletGenerated(wallet);
  }
}