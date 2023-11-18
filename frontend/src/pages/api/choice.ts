// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {seedToChoices} from '@/utils/seed'
import { Hex, toHex } from 'viem'
import {OpenAI} from 'openai'
import NodeCache from 'node-cache'
import {Story} from '@/interfaces/story'

const choiceCache = new NodeCache( { stdTTL: 120, checkperiod: 300 } );
const openai = new OpenAI();

async function writeStoryWithRetry(theme: string, yesStat: string, noStat: string, maxRetries: number) {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await writeStory(theme, yesStat, noStat);
        } catch (error) {
            console.log(error)
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    throw lastError;
}

async function writeStory(theme: string, yesStat: string, noStat: string): Promise<Story> {
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a story writing agent for role-playing game. The player will be give the role of the citizen in the country. The country theme will be ${theme}. You will write short story for player to make decision with yes/no choice. Each story choice will affect the stat of the player country. The more value in each stat will mean that your country is better in that aspect. The stat will have as follow:
      - Gold, is the stat of your country wealth
      - Science, is the stat of your country technology
      - Religion, is the stat of your country faith & religion
      - Nature, is the stat of your country natural resources
      There are some rules that you need to follow:
      - story should have no longer than 50 words.
      - do not mention about the country background story
      - add some the short description of the outcome of the yes/no choice. it should have no longer than 10 words. do not include the +/- stat in the outcome description
      - You should ONLY response in the JSON format as described below:
        - title: story title
        - emoji: emoji that represent the story title
        - description: story description. do not include +/- stat here. should have at least 10 words but no longer than 50 words
        - yes: yes choice outcome description
        - no: no choice outcome description
      }
      do not try to beautify the json result`,
        },
        {
          role: "user",
          content: `Please write a story that have a yes/no choice that will affect the stat of the player country as the following stat
      - yes: ${yesStat}
      - no: ${noStat}`
    }],
    model: 'gpt-4-1106-preview',
    temperature: 0.8
  })
  return {
    ...JSON.parse(response.choices[0].message.content || ''),
    yesStat: yesStat.trim(),
    noStat: noStat.trim()
  }
}

// GET /api/choice?seed=xxx&chainId=xxx
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Story[]>
) {
  if (req.method != "GET") {
    return res.status(404);
  }
  const statIndexMap = {
    'Gold': 0,
    'Science': 1,
    'Religion': 2,
    'Nature': 3
  }
  const themeMap: Record<number,string> = {
    534351: `autumn brown-ish medieval`,
    534352: `autumn brown-ish medieval`,
    5001: `futuristic modern neon teal`,
    5000: `futuristic modern neon teal`,
    1442: `fantasy mystic grand dark purple`,
    1101: `fantasy mystic grand dark purple`,
    84532: `dark-blue moonlight elf-y world treew dark blue and black`,
    8453: `dark-blue moonlight elf-y world treew dark blue and black`
  }
  const seed = req.query.seed as Hex
  const chainId:number = parseInt(req.query.chainId as string)
  const theme:string = themeMap[chainId]
  const choiceKey = `${seed}_${chainId}`
  if (choiceCache.has(choiceKey)){
    const stories = choiceCache.get<Story[]>(choiceKey) || []
    return res.status(200).json(stories)
  }
  const points = seedToChoices(seed)
  let stories:Story[] = new Array<Story>(5)
  await Promise.all(
    points.map(async (point, index) => {
      let yesStat = "";
      let noStat = "";
      point.plus.forEach((stat) => {
        const statPoint = parseInt(point.stats[statIndexMap[stat]].toString())
        if (statPoint > 0) {
          yesStat += `+${statPoint} ${stat} `;
          noStat += `-${statPoint} ${stat} `;
        } else {
          yesStat += `${statPoint} ${stat} `;
          noStat += `+${-1 * statPoint} ${stat} `;
        }
      });
      point.minus.forEach((stat) => {
        const statPoint = parseInt(point.stats[statIndexMap[stat]].toString())
        if (statPoint > 0) {
          yesStat += `${-1 * statPoint} ${stat} `;
          noStat += `+${statPoint} ${stat} `;
        } else {
          yesStat += `+${-1 *statPoint} ${stat} `;
          noStat += `${statPoint} ${stat} `;
        }
      });
      const story = await writeStoryWithRetry(theme, yesStat, noStat, 3)
      stories[index] = story
  }))
  choiceCache.set(choiceKey, stories)
  res.status(200).json(stories)
}
