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
    const p1 = r[2];
    const p2 = r[3];

    let stats = [0, 0, 0, 0];

    stats[0] += Number((e1 & 3) === 0) * (3 - (p1 & 7));
    stats[1] += Number((e1 & 3) === 1) * (3 - (p1 & 7));
    stats[2] += Number((e1 & 3) === 2) * (3 - (p1 & 7));
    stats[3] += Number((e1 & 3) === 3) * (3 - (p1 & 7));

    stats[0] += Number((e2 & 3) === 0) * (3 - (p2 & 7));
    stats[1] += Number((e2 & 3) === 1) * (3 - (p2 & 7));
    stats[2] += Number((e2 & 3) === 2) * (3 - (p2 & 7));
    stats[3] += Number((e2 & 3) === 3) * (3 - (p2 & 7));

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
    };
  });

  return choices;
};
