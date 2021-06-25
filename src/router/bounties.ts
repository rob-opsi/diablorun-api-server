import { Router } from 'express'
import { getBounties } from '../collections/bounties'

export const router = Router()

router.get('/bounties', async function (req, res) {
  const bounties = await getBounties();
  res.json(bounties);
})
