exports.up = function(knex) {
  return knex.schema.createTable('demo_bookings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('lead_id').references('id').inTable('leads').onDelete('CASCADE');
    table.timestamp('scheduled_at').notNullable();
    table.specificType('status', 'booking_status').defaultTo('scheduled');
    table.text('meeting_link');
    table.text('notes_from_user');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('demo_bookings');
};
