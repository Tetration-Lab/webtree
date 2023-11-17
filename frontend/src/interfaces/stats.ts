export enum Stat {
  Gold = "Gold",
  Science = "Science",
  Religion = "Religion",
  Nature = "Nature",
}

export const statByIndex = (index: number) => {
  switch (index) {
    case 0:
      return Stat.Gold;
    case 1:
      return Stat.Science;
    case 2:
      return Stat.Religion;
    case 3:
      return Stat.Nature;
    default:
      throw new Error("Invalid stat index");
  }
};
