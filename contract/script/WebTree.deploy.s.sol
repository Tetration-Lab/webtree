// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {WebTree} from "../src/WebTree.sol";
import {ChoiceUltraVerifier} from "../src/choice_plonk_vk.sol";
import {EdOnBN254} from "solidity-ed-on-bn254/EdOnBN254V.sol";

contract Deploy is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ChoiceUltraVerifier choiceVerifier = new ChoiceUltraVerifier();
        new WebTree(
            0xf3066Db6F37C301bEE285c0DE8c795E19F6EFA5d,
            address(this),
            address(choiceVerifier),
            EdOnBN254.Affine(
                0xe1c6db864b52cd4a8dfbdba4f439107487a48ec111dca09f53ab5ab714604e02,
                0xbc7f1792d774c8024604f721b7da02b1f2968064aa65b6aaf23505af64e6d91e
            )
        );

        vm.stopBroadcast();
    }
}
