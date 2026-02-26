exports.up = function(knex) {
  return knex.schema.createTable('leads', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('email').unique().notNullable();
    table.text('first_name').notNullable();
    table.text('last_name').notNullable();
    table.specificType('job_title', 'user_role').notNullable();
    table.text('district_name').notNullable();
    table.text('school_name');
    table.text('phone_number');
    table.timestamp('deleted_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('leads');
};
