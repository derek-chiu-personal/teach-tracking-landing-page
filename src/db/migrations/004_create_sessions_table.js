exports.up = function(knex) {
  return knex.schema.createTable('sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('lead_id').references('id').inTable('leads').onDelete('CASCADE');
    table.text('ip_address');
    table.text('user_agent');
    table.text('utm_source');
    table.text('utm_medium');
    table.text('utm_campaign');
    table.text('referrer_url');
    table.text('landing_page_url');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sessions');
};
