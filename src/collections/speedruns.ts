import { Character } from './characters';

export interface Speedrun {
  run_time: number;
  submit_time: number;
  seconds_played: number;

  category_id: number;
  players_category: 'p1' | 'px' | 'p8';
  hc: boolean;
  hero: Character["hero"];
  character_id: number | null;

  speedrun_offset: number | null;
  speedrun_id: string | null;
  speedrun_link: string | null;
  speedrun_user_id: string | null;
}

// Speedrun.com user
export interface SpeedrunUser {
  id: string;
  user_id: number | null;
  name: string;
  weblink: string;
  light_color_from: string;
  light_color_to: string;
  dark_color_from: string;
  dark_color_to: string;
  country_code: string | null;
  twitch: string | null;
  hitbox: string | null;
  youtube: string | null;
  twitter: string | null;
  speedrunslive: string | null;
}
