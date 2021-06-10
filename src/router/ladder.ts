import { Router } from 'express'
import { getCurrentLadder } from '../collections/ladders'
import db from '../services/db'

export const router = Router()

router.get('/ladder', async function (req, res) {
  const query: {
    limit?: string
    offset?: string
    d2_mod?: string
    hc?: string
    hero?: string
  } = req.query
  const ladder = await getCurrentLadder()

  if (!ladder) {
    res.json({
      statistics: { users: 0, characters: 0 },
      rows: [],
      pagination: {
        more: false,
        offset: 0,
      },
    })
    return
  }

  // Statistics
  const ladderFilter = `ladder_id=${ladder.id} AND experience > 0`
  const statistics = await db.query(`
    SELECT
      COUNT(*)::int AS characters,
      COUNT(DISTINCT user_id)::int AS users
    FROM characters
    WHERE ${ladderFilter}
  `)

  // Build filter from query
  const filterKeys = []
  const filterValues = []

  if (query.d2_mod) {
    filterKeys.push('d2_mod')
    filterValues.push(query.d2_mod)
  }

  if (query.hc) {
    filterKeys.push('hc')
    filterValues.push(query.hc)
  }

  if (query.hero) {
    filterKeys.push('hero')
    filterValues.push(query.hero)
  }

  // Global filter
  let charactersFilter = [
    ladderFilter,
    ...filterKeys.map((key, i) => `characters.${key}=$${i + 1}`),
  ].join(' AND ')

  // Pagination
  const limit = Math.min(30, parseInt(query.limit || '30'))
  const orderDir = req.query.order_dir === 'ASC' ? 'ASC' : 'DESC'
  let orderBy = 'experience'

  if (query.offset) {
    filterValues.push(query.offset)
    charactersFilter += ` AND characters.${orderBy} ${
      orderDir === 'ASC' ? '>=' : '<='
    } $${filterValues.length}`
  }

  const { rows } = await db.query(
    `
    SELECT
      characters.id, characters.name, characters.hero, characters.level, characters.experience::int,
      characters.hc, characters.start_time, characters.update_time, characters.in_game_time,
      users.name AS user_name,
      users.country_code AS user_country_code,
      users.dark_color_from AS user_color
    FROM characters
    INNER JOIN users ON characters.user_id = users.id
    WHERE ${charactersFilter}
    ORDER BY ${orderBy} ${orderDir}
    LIMIT ${limit + 1}
  `,
    filterValues,
  )

  res.json({
    statistics: statistics.rows[0],
    rows: rows.slice(0, limit),
    pagination: {
      more: rows.length > limit,
      offset: rows.length ? rows[rows.length - 1][orderBy] : 0,
    },
  })
})
