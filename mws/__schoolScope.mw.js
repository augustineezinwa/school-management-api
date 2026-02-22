function getMongoModels(managers) {
    return {
        ...(managers?.school?.mongomodels || {}),
        ...(managers?.student?.mongomodels || {}),
        ...(managers?.classroom?.mongomodels || {}),
        ...(managers?.user?.mongomodels || {}),
    };
}

async function resolveSchoolId({ resolver, context, managers, utils }) {
    if (!resolver) return null;

    // Backward-compatible plain path support: "params.id", "body.schoolId"
    if (typeof resolver === "string") {
        return utils.getId(utils.getByPath(context, resolver));
    }

    // Prefer direct school id extraction when available (no query required)
    if (resolver.schoolIdPath) {
        const paths = Array.isArray(resolver.schoolIdPath) ? resolver.schoolIdPath : [resolver.schoolIdPath];
        for (const path of paths) {
            const value = utils.getId(utils.getByPath(context, path));
            if (value) return value;
        }
        return null;
    }

    // Query only when resolver points to a resource id/type
    if (resolver.resourceType) {
        const scopeMap = require("../static_arch/school_scope.map");
        const config = scopeMap?.[resolver.resourceType];
        if (!config) return null;

        const resourceId = utils.getByPath(context, resolver.resourceIdPath || "params.id");
        if (!resourceId) return null;

        const models = getMongoModels(managers);
        const model = models?.[config.model];
        if (!model) return null;

        const doc = await model.findById(resourceId);
        return utils.getId(doc?.[config.schoolIdField]);
    }

    return null;
}

module.exports = ({ config, managers, utils }) => {
    return async ({ req, res, results, next }) => {
        const moduleName = req?.params?.moduleName;
        const fnName = req?.params?.fnName;
        const policyKey = `${moduleName}.${fnName}`;
        const policy = config?.rbacPolicy?.[policyKey];

        if (!policy || policy.scope !== "school") return next({ ok: true });

        const auth = results?.__longToken;
        if (!auth?.userId) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: "unauthorized" });
        }

        // Scope enforcement only applies to school_admin.
        if (auth.role !== "school_admin") return next({ ok: true });

        const actorSchoolId = utils.getId(auth.schoolId);
        if (!actorSchoolId) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: "unauthorized" });
        }

        const context = { body: req.body || {}, params: req.params || {}, auth, results };

        const targetSchoolId = await resolveSchoolId({ resolver: policy.nodeId, context, managers, utils });
        if (!targetSchoolId || targetSchoolId !== actorSchoolId) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 403, errors: "forbidden" });
        }

        if (policy.fromNodeId) {
            const sourceSchoolId = await resolveSchoolId({ resolver: policy.fromNodeId, context, managers, utils });
            if (!sourceSchoolId || sourceSchoolId !== actorSchoolId) {
                return managers.responseDispatcher.dispatch(res, { ok: false, code: 403, errors: "forbidden" });
            }
        }

        next({ ok: true });
    };
};
