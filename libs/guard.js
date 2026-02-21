function extractAuth(results, authKey) {
    return (results && results[authKey]) || null;
  }
  
  function hasRole(authPayload, allowedRoles = []) {
    if (!allowedRoles.length) return true;
    return allowedRoles.includes(authPayload?.role);
  }
  
  async function authorize({ policy, results, managers, body, params }) {
    if (!policy) return { ok: true };
  
    const authPayload = extractAuth(results, policy.auth);
    if (!authPayload) return { ok: false, code: 401, error: "unauthorized" };
  
    if (!hasRole(authPayload, policy.allowedRoles)) {
      return { ok: false, code: 403, error: "forbidden" };
    }
  
    // Optional SharkFin check for fine-grained access
    if (policy.layer && policy.action && managers?.shark) {
      const userId = authPayload.userId;
      const nodeId = body?.schoolId || params?.id; // keep simple first
      const granted = await managers.shark.isGranted({
        userId,
        layer: policy.layer,
        action: policy.action,
        nodeId
      });
      if (!granted) return { ok: false, code: 403, error: "forbidden" };
    }
  
    return { ok: true };
  }
  
  module.exports = { authorize };