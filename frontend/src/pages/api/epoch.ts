// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { WEBTREE_ABI, getContract } from "@/constants/contracts";
import { getChain } from "@/constants/web3";
import { decryptElgmal } from "@/utils/elgamal";
import { buildBabyjub } from "circomlibjs";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  Hex,
  createPublicClient,
  createWalletClient,
  fromHex,
  http,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// GET /api/epoch?chainId=xxx
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const privateKey = process.env.BACKEND_SK;
  if (!privateKey) throw new Error("BACKEND_SK is not set");
  const pw = process.env.PW;
  if (!pw) throw new Error("PW is not set");
  const parsedPw = req.query.pw;
  if (parsedPw !== pw) throw new Error("PW is not correct");
  const account = privateKeyToAccount(privateKey as Hex);
  const chainId: number = parseInt(req.query.chainId as string);
  const chain = getChain(chainId);
  if (!chain) throw new Error("chain not found");
  const contract = getContract(chainId);
  const wallet = createWalletClient({
    account,
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
  const provider = createPublicClient({
    transport: http(chain.rpcUrls.default.http[0]),
    chain,
  });

  const esworld = await provider.readContract({
    abi: WEBTREE_ABI,
    address: contract,
    functionName: "esworld",
  });
  //console.log("account", account.address);
  //console.log("esworld", esworld);
  const babyjubjub = await buildBabyjub();
  const sk = fromHex(privateKey as Hex, "bigint") % babyjubjub.order;
  //console.log("sk", sk);
  //const pk = babyjubjub.mulPointEscalar(babyjubjub.Base8, toHex(sk));
  //console.log(
  //"pk",
  //`0x${babyjubjub.F.toString(pk[0], 16)}`,
  //`0x${babyjubjub.F.toString(pk[1], 16)}`
  //);
  const decrypted = await decryptElgmal([esworld], toHex(sk));
  console.log("decrypted", decrypted);

  //const tx = await wallet.writeContract({
  //abi: WEBTREE_ABI,
  //address: contract,
  //functionName: "endEpoch",
  //args: [BigInt(decrypted[0])],
  //});
  //const receipt = await provider.waitForTransactionReceipt({ hash: tx });
  //if (receipt.status !== "success") throw new Error("transaction failed");
  //console.log("receipt", receipt);

  res.status(200).json({ status: "OK" });
}
