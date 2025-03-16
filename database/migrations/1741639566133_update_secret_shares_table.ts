import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'secret_shares'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_viewed')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_viewed').defaultTo(false)
    })
  }
}
