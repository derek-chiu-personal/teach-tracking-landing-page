exports.up = function(knex) {
  return knex.schema.createTable('video_analytics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('lead_id').references('id').inTable('leads').onDelete('CASCADE');
    table.text('video_id').notNullable();
    table.integer('watch_duration_seconds');
    table.boolean('completed').defaultTo(false);
    table.text('milestone_reached');
    table.boolean('clicked_cta_in_video').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['lead_id', 'video_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('video_analytics');
};
