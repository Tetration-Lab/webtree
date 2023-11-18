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
                0x776d39f138259c3ed9a5020c1939e73d35d2fb28b0f84b8e7b3f8a0bd1092f5,
                0x27de5e51b49cb749a252417f88f796e4413cd425ceec0ff700ab20c0810e1839
            )
        );

        vm.stopBroadcast();
    }
}
