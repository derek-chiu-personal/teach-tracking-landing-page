import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { videoProgressSchema } from '@/lib/validation';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'teach_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const validation = videoProgressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      video_id,
      watch_duration_seconds,
      current_time,
      completed,
      milestone_reached,
      clicked_cta_in_video,
      lead_id,
      ghost_id,
    } = validation.data;

    await client.query('BEGIN');

    if (lead_id) {
      const existingRecord = await client.query(
        `SELECT id, watch_duration_seconds, milestone_reached, completed 
         FROM video_analytics 
         WHERE lead_id = $1 AND video_id = $2`,
        [lead_id, video_id]
      );

      if (existingRecord.rows.length > 0) {
        const existing = existingRecord.rows[0];
        const newDuration = Math.max(existing.watch_duration_seconds, watch_duration_seconds);
        const newCompleted = completed || existing.completed;
        
        let newMilestone = existing.milestone_reached;
        if (milestone_reached && (!existing.milestone_reached || milestone_reached !== existing.milestone_reached)) {
          newMilestone = milestone_reached;
        }

        await client.query(
          `UPDATE video_analytics 
           SET watch_duration_seconds = $1, 
               completed = $2, 
               milestone_reached = $3,
               clicked_cta_in_video = COALESCE($4, clicked_cta_in_video),
               created_at = NOW()
           WHERE lead_id = $5 AND video_id = $6`,
          [newDuration, newCompleted, newMilestone, clicked_cta_in_video, lead_id, video_id]
        );
      } else {
        await client.query(
          `INSERT INTO video_analytics (lead_id, video_id, watch_duration_seconds, completed, milestone_reached, clicked_cta_in_video)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [lead_id, video_id, watch_duration_seconds, completed || false, milestone_reached, clicked_cta_in_video || false]
        );
      }
    }

    if (ghost_id) {
      const existingGhostRecord = await client.query(
        `SELECT id, watch_duration_seconds, milestone_reached, completed 
         FROM video_analytics 
         WHERE ghost_id = $1 AND video_id = $2`,
        [ghost_id, video_id]
      );

      if (existingGhostRecord.rows.length > 0) {
        const existing = existingGhostRecord.rows[0];
        const newDuration = Math.max(existing.watch_duration_seconds, watch_duration_seconds);
        const newCompleted = completed || existing.completed;
        
        let newMilestone = existing.milestone_reached;
        if (milestone_reached && (!existing.milestone_reached || milestone_reached !== existing.milestone_reached)) {
          newMilestone = milestone_reached;
        }

        await client.query(
          `UPDATE video_analytics 
           SET watch_duration_seconds = $1, 
               completed = $2, 
               milestone_reached = $3,
               clicked_cta_in_video = COALESCE($4, clicked_cta_in_video),
               created_at = NOW()
           WHERE ghost_id = $5 AND video_id = $6`,
          [newDuration, newCompleted, newMilestone, clicked_cta_in_video, ghost_id, video_id]
        );
      } else {
        await client.query(
          `INSERT INTO video_analytics (ghost_id, video_id, watch_duration_seconds, completed, milestone_reached, clicked_cta_in_video)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [ghost_id, video_id, watch_duration_seconds, completed || false, milestone_reached, clicked_cta_in_video || false]
        );
      }
    }

    await client.query('COMMIT');

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating video progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
