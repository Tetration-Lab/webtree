import { Story } from "@/interfaces/story";

export const TUTORIAL: Story[] = [
  {
    title: "New World?!?",
    emoji: "🌍",
    description:
      "You wake up in a strange place. You don't know where you are. Should you explore?",
    yes: "It's a beautiful place. with stunning nature. You feel at peace.",
    no: "You remember that you escaped from a dying world for a fresh start.",
    yesStat: "+5 Gold +0 Religion +0 Science +0 Nature",
    noStat: "+5 Gold +0 Religion +0 Science +0 Nature",
  },
  {
    title: "A lovely piece of land",
    emoji: "🌄",
    description: "You found a lovely piece of land. Should you settle here?",
    yes: "You build a cozy hut out of simple materials. It's started to look like your new life.",
    no: "You walk around the land and found an vacant hut. You decide to settle there.",
    yesStat: "+5 Gold +3 Religion +3 Science +0 Nature",
    noStat: "+5 Gold +3 Religion +3 Science +0 Nature",
  },
  {
    title: "Locals Approaching",
    emoji: "👫",
    description:
      "Locals start noticing your presence. should you talk to them?",
    yes: "They told you stories about the land. But you a bit skeptical about the druits?",
    no: "You casually observe them from a distance. They seem to be friendly. But there's a misterious figure in blue that interest you.",
    yesStat: "+0 Gold +7 Religion +7 Science +0 Nature",
    noStat: "+0 Gold +7 Religion +7 Science +0 Nature",
  },
  {
    title: "Hmm?!? a Druid in blue?!?",
    emoji: "🧙",
    description:
      "You found the druid in blue. He talk about his quest to protect the land. would you support him?",
    yes: "You donates some of your gold to him. He seems to be happy about it.",
    no: "You ignore him and walk away. He continue his work with a little tear in his eye.",
    yesStat: "+0 Gold +0 Religion +0 Science +0 Nature",
    noStat: "+0 Gold +0 Religion +0 Science +0 Nature",
  },
];
