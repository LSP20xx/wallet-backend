// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract WalletContract {
  uint256 private constant MIN = 1000000000000000;
  address private constant HOT_WALLET = 0x2d835f3395c5d7a6f1E743a00EFbd88523EC0B66;

  event Deposited();

  function forward() private {
    if(msg.value >= MIN) {
      (bool success, ) = HOT_WALLET.call{value: msg.value}("");
      require(success, "Failed to forward funds");
      emit Deposited();
    }
  }

  receive() external payable {
    forward();
  }
  fallback() external payable {
    forward();
  }
}
