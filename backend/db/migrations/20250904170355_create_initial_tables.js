exports.up = async function (knex) {
  await knex.schema.createTable("courses", (table) => {
    table.increments("id").primary();
    table.string("course_name", 255).notNullable().unique();
    table.string("image_url", 255).nullable();
    table.text("description").notNullable();
    table.string("sub_description", 500).nullable();
    table.string("duration_text", 100).notNullable();
    table.decimal("fee", 10, 2).notNullable();
    table.integer("batch_strength").notNullable().defaultTo(0);
    table.json("course_steps").nullable();
    table.boolean("isBlocked").notNullable().defaultTo(false);
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("students", (table) => {
    table.increments("id").primary();
    table.string("fullname", 255).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("phone", 20).notNullable().unique();
    table.string("password", 255).notNullable();
    table.integer("courseId").unsigned().nullable().references("id").inTable("courses").onUpdate("CASCADE").onDelete("SET NULL");
    table.boolean("isVerified").notNullable().defaultTo(false);
    table.string("otp", 10).nullable();
    table.timestamp("otpExpiresAt").nullable();
    table.boolean("isBlocked").notNullable().defaultTo(false);
    table.boolean("isApproved").notNullable().defaultTo(false);
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("students");
  await knex.schema.dropTableIfExists("courses");
};