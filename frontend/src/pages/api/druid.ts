// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { WEBTREE_ABI, getContract } from "@/constants/contracts";
import { DEFAULT_GLOBAL_STAT } from "@/constants/stats";
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
  parseEther,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// GET /api/druid?chainId=xxx
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const privateKey = process.env.BACKEND_SK;
  if (!privateKey) throw new Error("BACKEND_SK is not set");

  const pw = process.env.PW;
  if (!pw) throw new Error("PW is not set");

  const parsedPw = req.query.pw;
  if (
    !(
      parsedPw === pw ||
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
    )
  )
    throw new Error("Insufficient auth");

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
  const babyjubjub = await buildBabyjub();
  const sk = fromHex(privateKey as Hex, "bigint") % babyjubjub.order;
  const decrypted = await decryptElgmal([esworld], toHex(sk), 10000);
  console.log("decrypted", decrypted);

  const [balance, _spent, _count] = await provider.readContract({
    abi: WEBTREE_ABI,
    address: contract,
    functionName: "druid",
  });

  const w = parseEther("0.05", "wei");

  if (decrypted[0] <= 0.8 * DEFAULT_GLOBAL_STAT && balance > w) {
    const tx = await wallet.writeContract({
      abi: WEBTREE_ABI,
      address: contract,
      functionName: "druidAct",
      args: [w, BigInt(Math.round(0.005 * DEFAULT_GLOBAL_STAT))],
    });
    const receipt = await provider.waitForTransactionReceipt({ hash: tx });
    if (receipt.status !== "success") throw new Error("transaction failed");
    console.log("receipt", receipt);
  }

  res.status(200).json({ status: "OK" });
}
