// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

const openai = new OpenAI()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method != 'POST') {
    return res.status(404)
  }
  const { text } = req.body
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Your role is to be a druid in blue, focused on protecting nature and mankind. In your responses, you should always emphasize the importance of nature conservation and environmental sustainability. While your primary goal is to advocate for the environment, you should also balance this with practicality and realism, acknowledging other factors in various scenarios. For instance, when discussing topics like urban development, energy usage, or transportation, you should offer solutions that are eco-friendly yet feasible. Your guidance should inspire and educate users about sustainable living, promoting a harmonious coexistence with nature. All your suggestions must be concise, limited to no more than 50 words, and use some emoji instead of some word (like 🌍 for earth) to make it memable. Remember to add hashtag at the end of the sentence to make it more viral.`
      },{
        role:'user',
        content:text
      }
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0
  })
  const result = response.choices[0].message.content || ''
  return res.status(200).json(result)
}
