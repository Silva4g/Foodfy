const db = require('../../config/db')
const { date } = require('../../../lib/utils')


module.exports = {

  create(data) {
    const query = `
      INSERT INTO recipes (
        chef_id,
        title,
        ingredients,
        preparation,
        information,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `

    const values = [
      data.chef_id,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      date(Date.now()).iso,
    ]

    try {
      return db.query(query, values)
    } catch (err) {
      throw new Error(err)
    }
  },

  find(id) {
    try {
      return db.query(`
        SELECT recipes.*, chefs.name AS chef_name 
        FROM recipes
        LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        WHERE recipes.id = $1`,
        [id]
      )
    } catch (error) {
      throw new Error(err)
    }
  },

  update(data) {
    const query = `
      UPDATE recipes SET
        chef_id=($1),
        title=($2),
        ingredients=($3),
        preparation=($4),
        information=($5)
      WHERE id = $6
    `

    const values = [
      data.chef_id,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      data.id
    ]

    try {
      db.query(query, values)
    } catch (err) {
      throw new Error(err)
    }
  },

  delete(id) {
    try {
     return db.query(`
      DELETE FROM recipes where id = $1`,
      [id]
    )
    } catch (err) {
      throw new Error(err)
    }
  },

  chefSelectOptions() {
    try {
      return db.query(`SELECT name, id FROM chefs`)
    } catch (err) {
      throw new Error(err)
    }
  },

  files(id) {
    return db.query(`
      SELECT * FROM recipe_files
      WHERE recipe_id = $1`,
      [id]
    )
  },

  async paginate(params) {
    const { filter, limit, offset } = params

    let query = "",
        filterQuery = "",
        totalQuery = `(
          SELECT count(*) FROM recipes
        ) AS total`
        
    if (filter) {
      filterQuery = `
        WHERE recipes.title ILIKE '%${filter}%'
        `

      totalQuery = `(
        SELECT count(*) FROM recipes
        ${filterQuery}
      ) AS total`
    }
        
    query = `
      SELECT recipes.*, ${totalQuery}, chefs.name AS chef_name
      FROM recipes
      LEFT JOIN chefs on (recipes.chef_id = chefs.id)
      ${filterQuery}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`
    
    try {
      return db.query(query, [limit, offset]) 
    } catch (err) {
      throw new Error(err)
    }
  }
}
