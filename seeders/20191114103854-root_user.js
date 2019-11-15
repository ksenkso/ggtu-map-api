'use strict';
const {hashPassword} = require('../models/user.model.js');
module.exports = {
  up: async (queryInterface) => {
    console.log(hashPassword);
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const password = await hashPassword('root');
    return queryInterface.bulkInsert('Users', [{
      login: 'root',
      role: 'root',
      password,
      createdAt: new Date(),
      updatedAt: new Date()
    }])
  },

  down: (queryInterface) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('Users', null);
  }
};
