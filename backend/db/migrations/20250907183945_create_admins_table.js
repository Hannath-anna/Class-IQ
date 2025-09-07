exports.up = function(knex) {
  return knex.schema.createTable("admins", (table) => {
    table.increments("id").primary();
    table.string("fullname", 255).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("phone", 20).notNullable().unique();
    table.string("password", 255).notNullable();
    table.string("course", 255).nullable(); 
    table.integer('role_id').notNullable().references('id').inTable('roles');    
    table.boolean("isVerified").notNullable().defaultTo(false);
    table.string("otp", 10).nullable();
    table.timestamp("otpExpiresAt").nullable();    
    table.boolean("is_active").notNullable().defaultTo(false);
    table.boolean("isApproved").notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("admins");
};