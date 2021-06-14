import { Router } from 'express';
import { SpeedrunCategory } from 'src/types';
import { getSpeedrunCategories, getSpeedrunCategory } from '../collections/speedruns';
import db from '../services/db';

export const router = Router();

// Get speedruns
export async function getSpeedruns(query: any) {
  // Build filter from query
  const filterKeys = [];
  const filterValues = [];
  let filteredCategory: SpeedrunCategory | null = null;

  if (query.category_id) {
    filterKeys.push('category_id');
    filterValues.push(query.category_id);

    filteredCategory = await getSpeedrunCategory(query.category_id);
  }

  if (query.hc) {
    filterKeys.push('hc');
    filterValues.push(query.hc);
  }

  if (query.players_category && (!filteredCategory || !filteredCategory.px_only)) {
    filterKeys.push('players_category');
    filterValues.push(query.players_category);
  }

  if (query.hero) {
    filterKeys.push('hero');
    filterValues.push(query.hero);
  }

  // Global filter
  let runsFilter = '';
  let pbRunsFilter = '';

  if (filterKeys.length) {
    runsFilter = filterKeys.map((key, i) => `runs.${key}=$${i + 1}`).join(' AND ');
    pbRunsFilter = filterKeys.map((key, i) => `pb_runs.${key}=$${i + 1}`).join(' AND ');
  }

  // User filter
  let userFilter = `TRUE`;

  if (query.user_id) {
    filterValues.push(query.user_id);
    userFilter += ` AND runs.user_id=$${filterValues.length}`;
  }
  
  // Statistics
  const statistics = await db.query(`
    WITH pb_runs AS (
      SELECT
          *,
          ROW_NUMBER() OVER(PARTITION BY COALESCE(speedrun_user_id, user_id::text), category_id, players_category, hc, hero ORDER BY seconds_played ASC) AS personal_rank
      FROM speedruns
    ), runs AS (
      SELECT
        user_id,
        speedrun_user_id,
        RANK() OVER (PARTITION BY category_id, players_category, hc, hero ORDER BY seconds_played ASC) AS category_rank
      FROM pb_runs WHERE personal_rank=1 ${pbRunsFilter ? 'AND' : ''} ${pbRunsFilter}
    )
    SELECT
      COUNT(*)::int AS speedruns,
      COUNT(DISTINCT COALESCE(speedrun_user_id, user_id::text))::int AS users,
      COUNT(*) FILTER(WHERE category_rank=1)::int AS gold,
      COUNT(*) FILTER(WHERE category_rank=2)::int AS silver,
      COUNT(*) FILTER(WHERE category_rank=3)::int AS bronze
    FROM runs
    WHERE ${userFilter}
  `, filterValues);

  // Pagination
  const limit = Math.min(30, parseInt(query.limit || '30'));
  const orderDir = query.order_dir === 'DESC' ? 'DESC' : 'ASC';
  let orderBy = 'seconds_played';

  if (query.order_by === 'submit_time') {
    orderBy = query.order_by;
  }

  if (query.offset) {
    filterValues.push(query.offset);

    if (runsFilter) {
      runsFilter += ` AND runs.${orderBy} ${orderDir === 'ASC' ? '>=' : '<='} $${filterValues.length}`;
    } else {
      runsFilter = `runs.${orderBy} ${orderDir === 'ASC' ? '>=' : '<='} $${filterValues.length}`;
    }
  }

  // Data
  const speedruns = await db.query(`
    WITH pb_runs AS (
      SELECT
          *,
          ROW_NUMBER() OVER(PARTITION BY COALESCE(speedrun_user_id, user_id::text), category_id, players_category, hc, hero ORDER BY seconds_played ASC) AS personal_rank
      FROM speedruns
    ), runs AS (
      SELECT
        *,
        (RANK() OVER (PARTITION BY category_id, players_category, hc, hero ORDER BY seconds_played ASC))::int AS category_rank
      FROM pb_runs WHERE personal_rank=1
    )
    SELECT
        runs.id,
        runs.user_id,
        runs.character_id,
        runs.speedrun_link,
        runs.run_time,
        runs.submit_time,
        runs.category_id,
        runs.players_category,
        runs.hc,
        runs.hero,
        runs.seconds_played,

        speedrun_categories.name AS category_name,
          
        characters.name AS character_name,
        COALESCE(users.name, speedrun_users.name) AS user_name,
        COALESCE(users.country_code, speedrun_users.country_code) AS user_country_code,
        COALESCE(users.dark_color_from, speedrun_users.dark_color_from) AS user_color,
        speedrun_users.weblink AS speedrun_user_weblink,
        
        (RANK() OVER (ORDER BY runs.seconds_played ASC))::int AS rank,
        runs.category_rank
    FROM runs
    INNER JOIN speedrun_categories ON runs.category_id = speedrun_categories.id
    LEFT OUTER JOIN speedrun_users ON runs.speedrun_user_id = speedrun_users.id
    LEFT OUTER JOIN users ON runs.user_id = users.id
    LEFT OUTER JOIN characters ON runs.character_id = characters.id
    WHERE ${runsFilter} ${runsFilter ? 'AND' : ''} ${userFilter} ORDER BY runs.${orderBy} ${orderDir}
    LIMIT ${limit + 1}
  `, filterValues);

  return {
    statistics: statistics.rows[0],
    speedruns: speedruns.rows.slice(0, limit),
    pagination: {
      more: speedruns.rows.length > limit,
      offset: speedruns.rows.length ? speedruns.rows[speedruns.rows.length - 1][orderBy] : 0
    }
  };
}

// Get speedrun categories
router.get('/categories', async function (req, res) {
  const categories = await getSpeedrunCategories();
  res.json(categories);
});

router.get('/speedruns', async function (req, res) {
  res.json(await getSpeedruns(req.query));
});
