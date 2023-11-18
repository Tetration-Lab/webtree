// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {WebTree} from "../src/WebTree.sol";
import {UltraVerifier} from "../src/ChoicePlonkVK.sol";
import {EdOnBN254} from "solidity-ed-on-bn254/EdOnBN254V.sol";

contract Deploy is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        UltraVerifier choiceVerifier = new UltraVerifier();
        new WebTree(
            0xf3066Db6F37C301bEE285c0DE8c795E19F6EFA5d,
            address(this),
            address(choiceVerifier),
            EdOnBN254.Affine(
                0x3b7bb478f9aa6e6bf2afb2f50edc36b314fc5c340326a0a791f79cc34cde58c,
                0x19d288743772bb60afc777b4a7c7d1a9a39af27424d011b2e1b8ed6741aac15a
            )
        );

        vm.stopBroadcast();
    }
}
