function resolveUserId({ resolver, context, utils }) {
    if (!resolver) return null;

    if (typeof resolver === "string") {
        return utils.getId(utils.getByPath(context, resolver));
    }

    if (resolver.userIdPath) {
        return utils.getId(utils.getByPath(context, resolver.userIdPath));
    }

    return null;
}

module.exports = ({ config, managers, utils }) => {
    return ({ req, res, results, next }) => {
        const moduleName = req?.params?.moduleName;
        const fnName = req?.params?.fnName;
        const policyKey = `${moduleName}.${fnName}`;
        const policy = config?.rbacPolicy?.[policyKey];

        if (!policy || policy.scope !== "user") return next({ ok: true });

        const auth = results?.__longToken;
        if (!auth?.userId) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: "unauthorized" });
        }

        if (auth.role === "super_admin") return next({ ok: true });

        const context = { body: req.body || {}, params: req.params || {}, auth, results };
        const targetUserId = resolveUserId({ resolver: policy.nodeId, context, utils });

        if (!targetUserId || targetUserId !== utils.getId(auth.userId)) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 403, errors: "forbidden" });
        }

        if (policy.fromNodeId) {
            const sourceUserId = resolveUserId({ resolver: policy.fromNodeId, context, utils });
            if (!sourceUserId || sourceUserId !== utils.getId(auth.userId)) {
                return managers.responseDispatcher.dispatch(res, { ok: false, code: 403, errors: "forbidden" });
            }
        }

        next({ ok: true });
    };
};
