/* eslint-disable no-console */

// Hapi server imports
import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
import swagger from 'hapi-swagger';
import jwt from 'hapi-auth-jwt2';
import api from './api';
import hapiWebpack from '../webpack/hapiWebpack';
// React imports
import React from 'react';
import { renderToString } from 'react-dom/server';

// React-router routes and history imports
import getRoutes from './routes';
import createHistory from 'history/lib/createMemoryHistory';

// Redux imports
import { Provider } from 'react-redux';

// Import Intl
import { IntlProvider } from 'react-intl';

// Configure Redux Store
import configureStore from './store/configureStore';
import { setUserAgent } from './actions/userActions';
import { setActiveReducers } from './actions/extensionsActions';

// Redux router imports
import { ReduxRouter } from 'redux-router';
import { reduxReactRouter, match } from 'redux-router/server';
import qs from 'query-string';

// Import helpers
import ApiClient from './helpers/ApiClient';
import Html from './helpers/Html';
import getActiveExtensions from './helpers/getActiveReducers';
import makeRouteHooksSafe from './helpers/makeRouteHooksSafe';
// Import config file
import config from './config';

// Start server function
const startServer = ( callback ) => {
  let debugMode = {};
  let compiler = null;
  let developmentOnly = false;
  if (__DEVELOPMENT__) {
    // Hapi Server debug settings
    debugMode = { debug: { request: [ 'error', 'request-internal' ] }};
    // Webpack Developer Settings
    developmentOnly = true; // set to false if you need webpack dev on production.
    // Webpack compiler
    compiler = require('webpack')( require('../webpack/dev.config') );
  }
  // Create the Walmart Labs Hapi Server
  const server = new Hapi.Server(debugMode);
  // Configure connections
  server.connection({
    host: SERVER_HOST,
    port: SERVER_PORT,
    labels: [ 'api' ],
    routes: {
      cors: {
        origin: [ PROTOCOL + SERVER_HOST + ':' + SERVER_PORT ]
      }
    }
  });

  // Set names for each connection
  server.connections[0].name = 'API';

  const apiServer = server.select('api');

  const assets = {
    // webpack-dev-middleware options
    // See https://github.com/webpack/webpack-dev-middleware
    publicPath: '/',
    contentBase: 'src',
    lazy: false,
    watchOptions: {
      // aggregateTimeout: 300,
      // poll: false,
      signal: true
    },
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  };
  const hot = {
    // webpack-hot-middleware options
    // See https://github.com/glenjamin/webpack-hot-middleware
    timeout: '20000',
    reload: true
  };

  server.register([
    Inert, Vision, jwt,
    {
      register: hapiWebpack,
      options: {
        compiler,
        assets,
        hot,
        developmentOnly
      }
    }, {
      register: api,
      routes: {
        prefix: config.api.routes.path
      }
    }, {
      register: swagger,
      options: {
        documentationPath: config.api.swagger.documentationPath
      }
    }], { select: [ 'api' ] }, ( error ) => {
      if ( error ) {
        return console.error( error );
      }
      /**
       * Attempt to serve static requests from the public folder.
       */
      server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
          directory: {
            path: 'static'
          }
        }
      });

      /**
       * Cookie Settings
       */
      apiServer.state('USER_SESSION', {
        ttl: null,
        isSecure: !__DEVELOPMENT__,
        isHttpOnly: false,
        encoding: 'none',
        clearInvalid: false, // remove invalid cookies
        strictHeader: false // don't allow violations of RFC 6265
      });

      server.ext( 'onPreResponse', ( request, reply ) => {
        getActiveExtensions().then( activeExtensions => {
          if ( typeof request.response.statusCode !== 'undefined' ) {
            return reply.continue();
          }
          const client = new ApiClient(request);
          const store = configureStore(
            reduxReactRouter,
            makeRouteHooksSafe(getRoutes, activeExtensions),
            activeExtensions,
            createHistory,
            client
          );

          const output = (
            renderToString( <Html store={ store } /> )
          );

          const hydrateOnClient = () => {
            reply( '<!doctype html>\n' + output ).code(500);
          };

          return store.dispatch( match( request.path, ( error, redirectLocation, routerState ) => {
            if ( redirectLocation ) {
              reply.redirect( redirectLocation.pathname + redirectLocation.search );
            } else if ( error || !routerState ) {
              hydrateOnClient();
            } else if ( routerState ) {
              if (routerState.location.search && !routerState.location.query) {
                routerState.location.query = qs.parse(routerState.location.search);
              }
              const promises = [];
              let lang = require('./lang');
              lang = lang.extended(activeExtensions);
              promises.push(store.dispatch(setActiveReducers(activeExtensions)));
              Promise.all(promises).then(() => {
                store.dispatch(
                  setUserAgent(request.headers['user-agent']),
                  store.getState().router.then(() => {
                    const component = (
                      <Provider store={ store } key="provider">
                        <IntlProvider
                          key={ store.getState().user.data.locale }
                          locale={ store.getState().user.data.locale }
                          messages={ lang[store.getState().user.data.locale] }>
                          <ReduxRouter />
                        </IntlProvider>
                      </Provider>
                    );

                    const output = (
                        renderToString( <Html component={ component } store={ store } /> )
                      );

                    reply( '<!doctype html>\n' + output);
                  })
                  .catch(err => reply('error on server side: ' + err.stack))
                );
              });
            }
          }));
        });
      });
    });
  // Start Development Server
  return server.start(() => callback( server ));
};

export default startServer;
