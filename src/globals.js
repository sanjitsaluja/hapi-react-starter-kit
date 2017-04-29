import config from './config';
// Prevent issues with libraries using this var (see http://tinyurl.com/pcockwk)
delete process.env.BROWSER;

// Check enviroment for production
const enviroment = process.env.NODE_ENV || 'development';
global.__DEVELOPMENT__ = enviroment === 'development';
global.__PRODUCTION__ = enviroment === 'production';

// Define defaults for development
let defaultServerProtcol = 'http://';
let defaultServerHOST = 'localhost';
let defaultServerPORT = 3000;
let defaultServerURI = config.server.deveplopmentUrl;
// Define defaults for production

if ( __PRODUCTION__ ) {
  defaultServerProtcol = config.server.protocol;
  defaultServerHOST = 'localhost';
  defaultServerPORT = 8080;
  defaultServerURI = config.server.productionUrl;
}

// Define protocol (http or https)
const PROTOCOL = defaultServerProtcol;
// Define cloud server host and port (For deployments) eg: OpenShift, Heorku...
const serverHOST = process.env.OPENSHIFT_NODEJS_IP; // REPLACE WITH YOUR SERVER's IP
const serverPORT = process.env.OPENSHIFT_NODEJS_PORT; // REPLACE WITH YOUR SERVER's PORT

// Define Global Variables
global.PROTOCOL = PROTOCOL;
// Define server host and port
global.SERVER_HOST = serverHOST || process.env.HOST || defaultServerHOST; // Defaults to localhost for deveplopment
global.SERVER_PORT = serverPORT || process.env.PORT || defaultServerPORT;
global.SERVER_URI = defaultServerURI;
