import { Address, parseAbi } from "viem";
import { chains } from "./web3";
import _ from "lodash";

export const CONTRACTS: { [chainId: number]: Address } = chains.reduce(
  (acc, chain) => {
    if (!chain.world.contract) return acc;
    acc[chain.id] = chain.world.contract as Address;
    return acc;
  },
  {} as { [chainId: number]: Address }
);

export const getContract = (chainId: number): Address => {
  return CONTRACTS[chainId] ?? "0x0";
};

export const ERC20_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
]);

export const WEBTREE_ABI = parseAbi([
  "struct Affine { uint256 x; uint256 y; }",
  "struct CipherText { Affine c1; Affine c2; }",
  "struct UserStat { uint256 status; Affine publicKey; bytes32 commitment; CipherText es1; CipherText es2; CipherText es3; uint256 totalDonations; uint32 lastActionEpoch; uint32 totalActions; }",
  "function users(address) view returns (UserStat)",
  "function join(bytes32 commitment, Affine _publicKey)",
  "function epoch() view returns (uint32)",
  "function epochTime() view returns (uint256)",
  "function worldPublicKey() view returns (Affine)",
  "function action(Affine[] calldata _es, bytes calldata proof)",
  "function sworld() view returns (uint256)",
  "function esworld() view returns (CipherText)",
  "function endEpoch(uint worldTreeLatest)",
  "function donate() payable",
]);
