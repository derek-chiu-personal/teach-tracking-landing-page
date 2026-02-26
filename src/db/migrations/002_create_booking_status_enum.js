exports.up = function(knex) {
  return knex.raw('CREATE TYPE booking_status AS ENUM (\'scheduled\', \'completed\', \'no_show\', \'cancelled\')');
};

exports.down = function(knex) {
  return knex.raw('DROP TYPE booking_status');
};
