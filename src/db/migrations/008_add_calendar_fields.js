exports.up = function(knex) {
  return knex.schema
    .table('demo_bookings', (table) => {
      table.text('calendar_event_id').unique();
      table.text('attendee_name');
      table.text('attendee_email');
    });
};

exports.down = function(knex) {
  return knex.schema
    .table('demo_bookings', (table) => {
      table.dropColumn('calendar_event_id');
      table.dropColumn('attendee_name');
      table.dropColumn('attendee_email');
    });
};
