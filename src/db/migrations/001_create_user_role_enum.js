exports.up = function(knex) {
  return knex.raw('CREATE TYPE user_role AS ENUM (\'Administrator\', \'Special Ed Coordinator\', \'Teacher\', \'IT/Operations\', \'Other\')');
};

exports.down = function(knex) {
  return knex.raw('DROP TYPE user_role');
};
