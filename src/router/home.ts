import { Router } from 'express';
import db from '../services/db';
import { getActiveRace } from './races';

export const router = Router();

// Get recent speedruns
router.get('/home', async function (req, res) {
  const latestSpeedruns = await db.query(`
    WITH pb_runs AS (
      SELECT
          *,
          (ROW_NUMBER() OVER(PARTITION BY COALESCE(user_id::text, speedrun_user_id), category_id, players_category, hc, hero ORDER BY seconds_played ASC))::int AS personal_rank
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
      ORDER BY runs.run_time DESC
    LIMIT 10  
  `);
  
  const latestRecords = await db.query(`
    WITH pb_runs AS (
        SELECT
            *,
            (ROW_NUMBER() OVER(PARTITION BY COALESCE(user_id::text, speedrun_user_id), category_id, players_category, hc, hero ORDER BY seconds_played ASC))::int AS personal_rank
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
      WHERE runs.category_rank=1 ORDER BY runs.run_time DESC
      LIMIT 15
    `);
  
  const mostMedals = await db.query(`
    WITH pb_runs AS (
      SELECT
          *,
          (ROW_NUMBER() OVER(PARTITION BY COALESCE(user_id::text, speedrun_user_id), category_id, players_category, hc, hero ORDER BY seconds_played ASC))::int AS personal_rank
      FROM speedruns
  ), runs AS (
      SELECT
          *,
          (RANK() OVER (PARTITION BY category_id, players_category, hc, hero ORDER BY seconds_played ASC))::int AS category_rank
      FROM pb_runs WHERE personal_rank=1
  ), rankings AS (
      SELECT
          MAX(runs.speedrun_user_id) AS speedrun_user_id,
          MAX(runs.user_id) AS user_id,
          (COUNT(*) FILTER(WHERE category_rank=1))::int AS gold,
          (COUNT(*) FILTER(WHERE category_rank=2))::int AS silver,
          (COUNT(*) FILTER(WHERE category_rank=3))::int AS bronze
      FROM runs
      GROUP BY COALESCE(user_id::text, speedrun_user_id) ORDER BY gold DESC, silver DESC, bronze DESC
  )
  SELECT
      rankings.*,
      COALESCE(users.name, speedrun_users.name) AS user_name,
      COALESCE(users.country_code, speedrun_users.country_code) AS user_country_code,
      COALESCE(users.dark_color_from, speedrun_users.dark_color_from) AS user_color,
      speedrun_users.weblink AS speedrun_user_weblink,
      (RANK() OVER (ORDER BY gold DESC, silver DESC, bronze DESC))::int
  FROM rankings
  LEFT OUTER JOIN speedrun_users ON rankings.speedrun_user_id = speedrun_users.id
  LEFT OUTER JOIN users ON rankings.user_id = users.id
  WHERE (gold + silver + bronze) > 0
  LIMIT 15
  `);
  
  res.json({
    latestSpeedruns: latestSpeedruns.rows,
    latestRecords: latestRecords.rows,
    mostMedals: mostMedals.rows,
    activeRace: await getActiveRace()
  });
});
