const express = require('express');
const proxy = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const next = require('next');
const compression = require('compression');

const proxyAndroid = require('../next-dashboard/proxy/teamcity-android');
const proxyIos = require('../next-dashboard/proxy/teamcity-ios');
const proxyRedmine = require('../next-dashboard/proxy/redmine');
const api = require('./api');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = express();
    server.use(compression());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(bodyParser.json());
    server.use(bodyParser.text());
    server.use('/teamcity/ios', proxy(proxyIos));
    server.use('/teamcity/android', proxy(proxyAndroid));
    server.use('/redmine', proxy(proxyRedmine));

    server.use('/api', api);
    server.get('/admin/editProject', (req, res) => res.redirect('/admin'));
    server.get('/admin/deleteProject', (req, res) => res.redirect('/admin'));
    server.get('/admin/addProject', (req, res) => res.redirect('/admin'));
    server.get('*', (req, res) => handle(req, res));
    server.listen(port, (error) => {
      if (error) console.warn(error);
      console.log(`Server is listening on ${port}`);
    });
  });
