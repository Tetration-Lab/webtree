import { CipherText } from "@/interfaces/user";
import { Point, buildBabyjub, BabyJub } from "circomlibjs";
import _ from "lodash";
import { Hex, toHex } from "viem";

const packPoint = (bjj: BabyJub, point: Point): Hex => {
  return toHex(bjj.packPoint(point));
};

export const decryptElgmal = async (
  ciphertexts: CipherText[],
  privateKey: Hex,
  limit?: number
): Promise<number[]> => {
  const babyjub = await buildBabyjub();

  const map = new Map<Hex, number>();

  let prev = babyjub.Generator;
  _.range(1, limit ?? 4000).forEach((i) => {
    map.set(packPoint(babyjub, prev), i);
    prev = babyjub.addPoint(babyjub.Generator, prev);
  });

  const now = _.now();
  const res = ciphertexts.map((ciphertext) => {
    const c1 = [
      babyjub.F.fromObject(ciphertext.c1.x),
      babyjub.F.fromObject(ciphertext.c1.y),
    ] as Point;
    const c2 = [
      babyjub.F.fromObject(ciphertext.c2.x),
      babyjub.F.fromObject(ciphertext.c2.y),
    ] as Point;
    const s = babyjub.mulPointEscalar(c1, privateKey);
    const negS = [babyjub.F.neg(s[0]), s[1]];
    const m = babyjub.addPoint(c2, negS as Point);

    return map.get(toHex(babyjub.packPoint(m))) ?? 0;
  });
  console.log("decrypt time", (_.now() - now) / 1000, "ms");

  return res;
};
