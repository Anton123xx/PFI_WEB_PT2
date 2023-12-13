/////////////////////////////////////////////////////////////////////
// This module is the starting point of the http server
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

import APIServer from "./APIServer.js";
import RouteRegister from './routeRegister.js';

RouteRegister.add('GET', 'accounts');
RouteRegister.add('POST', 'accounts', 'register');
RouteRegister.add('GET', 'accounts', 'verify');
RouteRegister.add('GET', 'accounts', 'logout');
RouteRegister.add('PUT', 'accounts', 'modify');
RouteRegister.add('GET', 'accounts', 'remove');
RouteRegister.add('GET', 'accounts', 'conflict');
RouteRegister.add('POST', 'accounts', 'block');
RouteRegister.add('POST', 'accounts', 'promote');
////POUR VAS CALL CONTROLLER DE PHOTO
RouteRegister.add('POST', 'photos', 'upload');
RouteRegister.add('PUT', 'photos', 'modify');
RouteRegister.add('GET', 'photos', 'delete');
RouteRegister.add('POST', 'photos', 'like');
RouteRegister.add('POST', 'photos', 'unlike');


let server = new APIServer();
server.start();