//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/MonadLogoNFT.sol";
import "./DeployHelpers.s.sol";

contract DeployMonadLogoNFT is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        MonadLogoNFT monadLogoNFT = new MonadLogoNFT();
        console.logString(string.concat("MonadLogoNFT deployed at: ", vm.toString(address(monadLogoNFT))));
        monadLogoNFT.toggleMinting();
    }
}
