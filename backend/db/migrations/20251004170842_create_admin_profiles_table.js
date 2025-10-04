 exports.up = function(knex) {
    return knex.schema.createTable('admin_profiles', (table) => {
        table.increments('id').primary();
        table.integer('admin_id').unsigned().notNullable().unique().references('id').inTable('admins').onDelete('CASCADE');
        table.string('profile_picture_url', 255).nullable();
        table.json('qualifications').nullable().comment('Stores qualifications as a JSON array of strings, e.g., ["M.Sc. in Computer Science", "Ph.D. in AI"]');
        table.json('address').nullable().comment('Stores address as an object: { street, city, state, zip, country }');
        table.timestamp("createdAt").defaultTo(knex.fn.now());
        table.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('admin_profiles');
};