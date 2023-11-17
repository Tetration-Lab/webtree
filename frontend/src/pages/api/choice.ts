// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {OpenAI} from 'openai'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const theme = `autumn brown-ish medieval`
  const openai = new OpenAI();
  const response = await openai.chat.completions.create({
    messages: [{
      role:'system',
      content: `You are a story writing agent for role-playing game. The player will be give the role of the king ot the country. The country theme will be ${theme}. The story you write will be a short story for player to make decision with yes/no choice. Each story choice will affect the stat of the player country. The story should have  no longer than 25 words. All stat will have value 0 to 100. The more value in each stat will mean that your country is better in that aspect. The stat will have as follow:
      - gold, is the stat of your country wealth
      - science, is the stat of your country technology
      - religion, is the stat of your country faith & religion
      - nature, is the stat of your country natural resources
      There are some rules that you need to follow:
      - do not mention about that player is a king of the country
      - do not mention about the country background story
      - do not include the +/- of stat of the yes/no choice
      - add some the short description of the outcome of the yes/no choice. it should have no longer than 10 words`
      
    },{
      role: 'user',
      content: `Please write a story that have a yes/no choice that will affect the stat of the player country as the following stat
      - yes: +10 science, -10 nature
      - no: -10 science, +10 nature`
    }],
    model: 'gpt-3.5-turbo-16k-0613',
    temperature: 0.5
  })
  console.log(response.choices[0].message)

  if (req.method == 'POST') {
    // xxx 
  }
  res.status(200).json(response.choices[0].message)
}
