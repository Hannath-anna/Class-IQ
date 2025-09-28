  exports.up = function(knex) {
    return knex.schema.createTable('student_profiles', (table) => {
      table.increments('id').primary();
      table.integer('student_id').unsigned().notNullable().unique().references('id').inTable('students').onDelete('CASCADE');
      table.string('profile_picture_url', 255).nullable();
      table.string('qualifications', 500).nullable().comment('e.g., "High School Diploma", "B.Sc. in Physics"');
      table.json('address').nullable().comment('Stores address as an object: { street, city, state, zip, country }');
      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
  };

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('student_profiles');
};