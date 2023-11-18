// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {seedToChoices} from '@/utils/seed'
import { Hex, toHex } from 'viem'
import {OpenAI} from 'openai'

interface Story {
  title: string
  description: string
  yes: string
  no: string
  yesStat: string
  noStat: string
}

// GET /api/choice?seed=xxx&chainId=xxx
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Story[]>
) {
  if (req.method != 'GET'){
    return res.status(404)
  }
  const statIndexMap = {
    'Gold': 0,
    'Science': 1,
    'Religion': 2,
    'Nature': 3
  }
  const seed = req.query.seed as Hex
  const chainId = req.query.chainId as string || ''
  const theme = `autumn brown-ish medieval`
  const points = seedToChoices(seed)
  let stories:Story[] = new Array<Story>(5)
  const openai = new OpenAI();
  await Promise.all(points.map(async (point, index) => {
    let yesStat = ''
    let noStat = ''
    point.plus.forEach((stat) => {
      yesStat += `+${point.stats[statIndexMap[stat]]} ${stat} `
      noStat += `-${point.stats[statIndexMap[stat]]} ${stat} `
    })
    point.minus.forEach((stat) => {
      yesStat += `-${point.stats[statIndexMap[stat]]} ${stat} `
      noStat += `+${point.stats[statIndexMap[stat]]} ${stat} `
    })
    const response = await openai.chat.completions.create({
      messages: [{
        role:'system',
        content: `You are a story writing agent for role-playing game. The player will be give the role of the citizen in the country. The country theme will be ${theme}. You will write short story for player to make decision with yes/no choice. Each story choice will affect the stat of the player country. The more value in each stat will mean that your country is better in that aspect. The stat will have as follow:
        - Gold, is the stat of your country wealth
        - Science, is the stat of your country technology
        - Religion, is the stat of your country faith & religion
        - Nature, is the stat of your country natural resources
        There are some rules that you need to follow:
        - story should have no longer than 25 words.
        - do not mention about that player is a king of the country
        - do not mention about the country background story
        - add some the short description of the outcome of the yes/no choice. it should have no longer than 10 words. do not include the +/- stat in the outcome description
        - You should ONLY response in the JSON format as described below:
          - title: story title
          - description: story description
          - yes: yes choice outcome description
          - no: no choice outcome description
        }
        do not try to beautify the json result`
      },{
        role: 'user',
        content: `Please write a story that have a yes/no choice that will affect the stat of the player country as the following stat
        - yes: ${yesStat}
        - no: ${noStat}`
      }],
      model: 'gpt-3.5-turbo-16k-0613',
      temperature: 1.5
    })
    stories[index] = {
      ...JSON.parse(response.choices[0].message.content || ''),
      yesStat: yesStat.trim(),
      noStat: noStat.trim()
    }
  }))
  res.status(200).json(stories)
}
