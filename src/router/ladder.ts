import { Router } from 'express'
import db from '../services/db'

export const router = Router()

router.get('/ladder', async function (req, res) {
  const orderBy = 'experience'
  const orderDir = req.query.order_dir === 'ASC' ? 'ASC' : 'DESC'

  const { rows } = await db.query(`
    SELECT
      characters.id, characters.name, characters.hero, characters.level, characters.experience::int,
      characters.hc, characters.start_time, characters.update_time, characters.in_game_time,
      users.name AS user_name,
      users.country_code AS user_country_code,
      users.dark_color_from AS user_color
    FROM characters
    INNER JOIN users ON characters.user_id = users.id
    WHERE d2_mod='D2' AND start_time > 1622494800
    ORDER BY ${orderBy} ${orderDir}
    LIMIT 30
  `)

  res.json({
    rows,
    pagination: {
      more: false,
      offset: rows.length ? rows[rows.length - 1][orderBy] : 0,
    },
  })
})
