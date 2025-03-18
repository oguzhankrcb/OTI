import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'secret_shares'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('public_key')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('public_key', 'longtext').notNullable()
    })
  }
}
