import express from "express";
import path from "path";
import React from "react";
import Router from "react-router";

import Routes from "../components/routes.js";

export default class Server {
  constructor(port) {
    this.app = express();
    this.port = port;
  }

  start() {
    this.app.use(express.static(path.join(__dirname, '../../app/public')));
    this.app.use(require('connect-assets')({
      paths: [
        '../../__build__/assets/css', '../../bower_components'
      ].map(rel => { return path.join(__dirname, rel) })
    }));

    this.app.set("views", path.join(__dirname, "../../app/views"));
    this.app.set("view engine", "ejs");

    this.addRoutes();

    return this.app.listen(this.port);
  }

  addRoutes() {
    this.app.get("*", (req, res) => {
      let router = Router.create({ location: req.url, routes: Routes });
      let documentationSlug = this.getDocumentationSlugName(req);

      router.run((Handler) => {
        let page = undefined;
        if (documentationSlug) {
          page = React.renderToString(<Handler describedBy={documentationSlug}/>);
        } else {
          page = React.renderToString(<Handler />);
        }

        res.render("index.ejs", { page: page });
      });
    });
  }

  getDocumentationSlugName(req) {
    let regexp = /\/docs(.*)/;
    let match = regexp.exec(req.url);
    return (match || [])[1]
  }
}
