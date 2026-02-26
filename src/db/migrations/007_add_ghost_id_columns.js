exports.up = function(knex) {
  return knex.schema
    .table('leads', (table) => {
      table.uuid('ghost_id').unique();
    })
    .table('sessions', (table) => {
      table.uuid('ghost_id');
    })
    .table('video_analytics', (table) => {
      table.uuid('ghost_id');
    });
};

exports.down = function(knex) {
  return knex.schema
    .table('leads', (table) => {
      table.dropColumn('ghost_id');
    })
    .table('sessions', (table) => {
      table.dropColumn('ghost_id');
    })
    .table('video_analytics', (table) => {
      table.dropColumn('ghost_id');
    });
};
