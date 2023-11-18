import { CipherText } from "@/interfaces/user";
import { Point, buildBabyjub } from "circomlibjs";
import _ from "lodash";
import { Hex, toHex } from "viem";

export const decryptElgmal = async (
  ciphertexts: CipherText[],
  privateKey: Hex,
  limit?: number
): Promise<number[]> => {
  const babyjub = await buildBabyjub();

  let prev = babyjub.Generator;
  const map = new Map<Hex, number>();
  _.range(1, limit ?? 4000).forEach((i) => {
    map.set(toHex(babyjub.packPoint(prev)), i);
    prev = babyjub.addPoint(babyjub.Generator, prev);
  });

  const now = _.now();
  const res = ciphertexts.map((ciphertext) => {
    const s = babyjub.mulPointEscalar(
      [
        babyjub.F.fromObject(ciphertext.c1.x),
        babyjub.F.fromObject(ciphertext.c1.y),
      ],
      privateKey
    );
    const negS = [babyjub.F.neg(s[0]), s[1]];
    const m = babyjub.addPoint(
      [
        babyjub.F.fromObject(ciphertext.c2.x),
        babyjub.F.fromObject(ciphertext.c2.y),
      ],
      negS as Point
    );

    return map.get(toHex(babyjub.packPoint(m))) ?? 0;
  });
  console.log("decrypt time", (_.now() - now) / 1000, "ms");

  return res;
};
