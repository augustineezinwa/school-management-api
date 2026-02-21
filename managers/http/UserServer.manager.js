const http              = require('http');
const express           = require('express');
const cors              = require('cors');
const swaggerUi         = require('swagger-ui-express');
const openApiSpec       = require('../../config/openapi.config');
const app               = express();

module.exports = class UserServer {
    constructor({config, managers}){
        this.config        = config;
        this.userApi       = managers.userApi;
        this.registerDeclarativeRoutes = this.registerDeclarativeRoutes.bind(this);
    }
    
    /** for injecting middlewares */
    use(args){
        app.use(args);
    }

    registerDeclarativeRoutes() {
        const basePath = this.config.routesConfig?.basePath || "/api";
        const routes = this.config.routesConfig?.routes || [];

        routes.forEach((route) => {
            const method = (route.method || "get").toLowerCase();
            const routePath = `${basePath}${route.path}`;
            const target = route.target || "";
            const [moduleName, fnName] = target.split(".");

            if (!moduleName || !fnName || typeof app[method] !== "function") {
                console.warn(`skipping invalid route config:`, route);
                return;
            }

            app[method](routePath, (req, res, next) => {
                req.params = {
                    ...(req.params || {}),
                    moduleName,
                    fnName,
                };
                return this.userApi.mw(req, res, next);
            });
        });
    }

    /** server configs */
    run(){
        app.use(cors({origin: '*'}));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true}));
        app.use('/static', express.static('public'));

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send('Something broke!')
        });
        
        /** preferred declarative REST-style routes */
        this.registerDeclarativeRoutes();

        /** OpenAPI docs */
        app.get('/api/docs.json', (req, res) => {
            res.json(openApiSpec);
        });
        app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));

        /** backward-compatible dynamic routes */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);
        app.all('/api/:moduleName/:fnName/:id', this.userApi.mw);

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}