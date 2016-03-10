'use strict'

const Controller = require('trails-controller')


module.exports = class AuthController extends Controller {
  login(req, res) {
    this.app.services.PassportService.login(req.body.identifier, req.body.password).then(user => {
      if (this.app.config.session.strategies.jwt) {
        const token = this.app.services.PassportService.createToken(user)
        res.json({token: token, user: user})
      }
      else {
        res.json(user)
      }
    }).catch(e => {
      this.app.log.error(e)
      if (e.code == 'E_USER_NOT_FOUND') {
        res.notFound(req, res)
      }
      else {
        res.serverError(e, req, res)
      }
    })
  }

  provider(req, res) {
    this.app.services.PassportService.endpoint(req, res, req.params.provider)
  }

  callback(req, res) {
    this.app.services.PassportService.callback(req, res, (err, user, challenges, statuses) => {
      if (err) {
        this.app.log.error(err)
        res.serverError(err, req, res)
      }
      else {
        req.login(user, err => {
          if (err) {
            this.app.log.error(err)
            res.serverError(err, req, res)
          }
          else {
            // Mark the session as authenticated to work with default Sails sessionAuth.js policy
            req.session.authenticated = true

            // Upon successful login, send the user to the homepage were req.user
            // will be available.
            if (req.wantsJSON) {
              const result = {
                redirect: this.app.config.session.redirect.login,
                user: user
              }

              if (this.app.config.session.strategies.jwt) {
                result.token = this.app.services.PassportService.createToken(user)
              }
              res.json(result)
            }
            else {
              res.redirect(this.app.config.session.redirect.login)
            }
          }
        })
      }
    })
  }

  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut()) that
   * can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout(req, res) {
    req.logout()

    // mark the user as logged out for auth purposes
    if (req.session)
      req.session.authenticated = false

    if (req.wantsJSON) {
      res.json({redirect: this.app.config.session.redirect.logout})
    }
    else {
      res.redirect(this.app.config.session.redirect.logout)
    }
  }
}
