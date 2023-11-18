import { Stat, statByIndex } from "@/interfaces/stats";
import _ from "lodash";
import { Hex, fromHex, toBytes } from "viem";

export const seedToChoices = (seed: Hex) => {
  let currentSeed = fromHex(seed, "bigint");
  const choices = _.range(5).map(() => {
    const r = toBytes(currentSeed);

    currentSeed /= 1024n;

    const e1 = r[0];
    const e2 = r[1];
    const e3 = r[2];

    let stats = [0, 0, 0, 0];

    stats[0] += 4 - (e1 & 7);
    stats[1] += 4 - (e2 & 7);
    stats[2] += 4 - (e3 & 7);
    stats[3] += (e1 & 7) + (e2 & 7) + (e3 & 7) - 11;

    const plus: Stat[] = [];
    const minus: Stat[] = [];
    stats.forEach((s, i) => {
      if (s > 0) {
        plus.push(statByIndex(i));
      }
      if (s < 0) {
        minus.push(statByIndex(i));
      }
    });

    return {
      plus,
      minus,
      stats,
    };
  });

  return choices;
};
