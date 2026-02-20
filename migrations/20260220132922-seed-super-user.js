const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const password = await bcrypt.hash(process.env.SUPER_USER_PASSWORD, 10);
    const superUser = {
      email: process.env.SUPER_USER_EMAIL,
      password: password,
      firstName: 'Super',
      lastName: 'User',
      role: 'super_admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const superUserModel = db.collection('users');
    await superUserModel.insertOne(superUser);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("users").deleteOne({ email: process.env.SUPER_USER_EMAIL });
  }
};
