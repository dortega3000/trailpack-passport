'use strict'

module.exports = {
  redirect: {
    login: '/',//Login successful
    logout: '/'//Logout successful
  },

  onUserLogged: (app, user) => {
    return Promise.resolve(user)
  },
  onUserCreated: (app, user) => {
    return Promise.resolve(user)
  }
}
