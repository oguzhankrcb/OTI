import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'secret_shares'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('encrypted_text', 'longtext').notNullable()

      table.text('public_key', 'longtext').notNullable()

      table.string('access_id', 64).unique().notNullable()

      table.string('password_hash', 100).nullable()

      table.timestamp('expires_at').notNullable()

      table.boolean('is_viewed').defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
