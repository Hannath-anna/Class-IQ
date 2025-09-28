exports.up = function(knex) {
  return knex.schema.createTable("admins", (table) => {
    table.increments("id").primary();
    table.string("fullname", 255).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("phone", 20).notNullable().unique();
    table.string("password", 255).notNullable();
    table.integer("courseId").unsigned().nullable().references("id").inTable("courses").onUpdate("CASCADE").onDelete("SET NULL");
    table.integer('role_id').notNullable().references('id').inTable('roles');    
    table.boolean("isVerified").notNullable().defaultTo(false);
    table.string("otp", 10).nullable();
    table.timestamp("otpExpiresAt").nullable();    
    table.boolean("is_active").notNullable().defaultTo(false);
    table.boolean("isApproved").notNullable().defaultTo(false);
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("admins");
};