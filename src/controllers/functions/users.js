import Promise from 'bluebird';
import Iron from 'iron';
import JWT from 'jsonwebtoken';
import aguid from 'aguid';
import { encrypt, decrypt } from '../../helpers/forgeTools';
import isObjectEmpty from '../../helpers/objectTools';

import config from '../../config';

// Promisify JWT
Promise.promisifyAll(JWT);
// Promisify Iron
Promise.promisifyAll(Iron);

const key = 'users';
const users = {
  /**
   *  Create a new user.
   */
  create: ( request, callback ) => {
    const user = {
      id: 0,
      username: request.payload.username,
      email: request.payload.email,
      password: request.payload.password,
      scope: 'user'
    };
    return callback(null);
  },
  /**
   *  Get user by id.
   */
  read: ( request, callback ) => {
    return callback(null);
  },
  /**
   *  Update existing user
   */
   // TODO: Improve code
  update: ( request, callback ) => {
    const user = {
      id: request.params.id || request.payload.id || null,
      username: request.payload.username || null,
      email: request.payload.email || null,
      password: request.payload.password || null,
      locale: request.payload.locale || null
    };
    return callback(null);
  },
  /**
   *  Delete a user
   */
  delete: ( request, callback ) => {
    return callback(null);
  },
  /**
   *  Get users list
   *  Default: 10 users.
   */
  list: ( request, callback ) => {
    return callback(null);
  },
  /**
   *  Very user's credentials when logging in
   */
  login: ( request, callback ) => {
    return callback(null);
  },
  /**
   *  Logs the user out of the system
   */
  logout: ( request, callback ) => {
    return callback(null);
  },
  /**
   * Validate user's secret key
   */
  validate: ( decoded, request, callback ) => {
    return callback(null);
  },
  /**
   *  Issue new access token
   */
  oauth: ( request, callback ) => {
    return callback(null);
  },
  /**
   *  Verifies user's access
   */
  verify: ( request, callback ) => {
    return callback(result);
  }
};

const validateUser = users.validate;
export { users as default, validateUser };
