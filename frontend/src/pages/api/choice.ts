// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {seedToChoices} from '@/utils/seed'
import { Hex, toHex } from 'viem'
import {OpenAI} from 'openai'
import NodeCache from 'node-cache'
import {Story} from '@/interfaces/story'
import { keywordMap } from '@/constants/keywords'
import {chains} from '@/constants/web3'

const choiceCache = new NodeCache( { stdTTL: 120, checkperiod: 300 } );
const openai = new OpenAI();

async function writeStoryWithRetry(theme: string, yesStat: string, noStat: string, chainId: number, maxRetries: number) {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            let keyword = ""
            if (!keywordMap[chainId] || keywordMap[chainId].length == 0) {
              keyword = ""
            } else {
              const random = Math.round(Math.random() * 1000000) % keywordMap[chainId].length
              keyword = keywordMap[chainId][random]
            }
            return await writeStory(theme, yesStat, noStat, keyword);
        } catch (error) {
            console.log(error)
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    throw lastError;
}

async function writeStory(theme: string, yesStat: string, noStat: string, keyword:string): Promise<Story> {
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
      - story description and title can include ${keyword} for variety of content and be creative & surprise as much as possible
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
    temperature: 1.2
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
  const seed = req.query.seed as Hex
  const chainId:number = parseInt(req.query.chainId as string)
  const chain = chains.find((chain) => chain.id == chainId)
  if (!chain) {
    return res.status(404);
  }
  const theme:string = chain.world.description
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
          yesStat += `${statPoint} ${stat} `;
          noStat += `+${statPoint} ${stat} `;
        } else {
          yesStat += `${statPoint} ${stat} `;
          noStat += `+${ -1 * statPoint} ${stat} `;
        }
      });
      const story = await writeStoryWithRetry(theme, yesStat, noStat, chainId, 3)
      stories[index] = story
  }))
  choiceCache.set(choiceKey, stories)
  res.status(200).json(stories)
}
