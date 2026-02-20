function toPlain(v) {
    if (Array.isArray(v)) return v.map(toPlain);
    if (v && typeof v.toObject === "function") return v.toObject();
    return v;
  }
  
  function pick(obj, fields) {
    const out = {};
    for (const k of fields || []) {
      if (obj && obj[k] !== undefined) out[k] = obj[k];
    }
    return out;
  }
  
  function createSerializer(fieldExposed = {}) {
    return function serialize({ fnName, result }) {
      const config = fieldExposed[fnName] || fieldExposed.default;
      if (!config || !result || typeof result !== "object") return result;
      if (Array.isArray(result) || result?.errors || result?.error) return result;
  
      const plain = toPlain(result);
      const out = { ...plain };
  
      // config shape: { user: ["_id","email"], school: ["_id","name"] }
      for (const key of Object.keys(config)) {
        const fields = config[key];
        const value = plain[key];
        if (Array.isArray(value)) out[key] = value.map((i) => pick(i, fields));
        else out[key] = pick(value, fields);
      }
  
      return out;
    };
  }
  
  module.exports = { createSerializer };