/* ADM Preview State — creates an isolated, non-persistent project snapshot. */
(() => {
  "use strict";
  const isRecord = value => !!value && typeof value === "object" && !Array.isArray(value);
  const finite = value => typeof value === "number" && Number.isFinite(value);
  const fail = (code, message) => ({ ok: false, code, message, mutatesSource: false });
  const build = (project, effects) => {
    if (!isRecord(project) || !Array.isArray(project.nodes) || !Array.isArray(effects)) {
      return fail("invalid_preview_input", "No se pudo construir la vista previa con los datos recibidos.");
    }
    if (effects.length < 1 || effects.length > 50) return fail("invalid_effect_count", "La vista previa admite entre 1 y 50 efectos.");
    if (project.nodes.some(node => node && node.mesh)) {
      return fail("mesh_preview_unavailable", "La vista previa aislada aún no representa deformaciones de malla/skinning. Se canceló para no mostrar un resultado engañoso.");
    }
    const snapshot = JSON.parse(JSON.stringify(project));
    const nodes = new Map(snapshot.nodes.map(node => [String(node.id), node]));
    const applyTransform = (id, values) => {
      const node = nodes.get(String(id));
      if (!node || !isRecord(values)) return false;
      for (const key of ["x", "y", "rotation", "scale"]) {
        if (values[key] !== undefined) {
          if (!finite(values[key])) return false;
          node[key] = values[key];
        }
      }
      return true;
    };
    for (const effect of effects) {
      if (!isRecord(effect)) return fail("invalid_effect", "La propuesta contiene un efecto inválido.");
      if (effect.type === "set_part_transform") {
        if (!applyTransform(effect.targetId, effect.after)) return fail("unknown_preview_target", "Una pieza de la propuesta ya no existe o contiene valores inválidos.");
      } else if (effect.type === "apply_pose") {
        if (!Array.isArray(effect.nodes) || !effect.nodes.length) return fail("pose_preview_unavailable", "La pose no contiene transformaciones verificables.");
        for (const poseNode of effect.nodes) {
          if (!poseNode || !applyTransform(poseNode.id, poseNode)) return fail("unknown_pose_target", "La pose contiene una pieza inexistente o valores inválidos.");
          const node = nodes.get(String(poseNode.id));
          if (poseNode.shape !== undefined) {
            if (typeof poseNode.shape !== "string" || poseNode.shape.length > 80) return fail("invalid_pose_shape", "La pose contiene una forma no válida.");
            node.shape = poseNode.shape;
          }
        }
      } else if (effect.type === "solve_ik") {
        if (!isRecord(effect.rotations)) return fail("invalid_ik_preview", "La solución IK no contiene rotaciones.");
        for (const [id, rotation] of Object.entries(effect.rotations)) {
          if (!applyTransform(id, { rotation })) return fail("unknown_ik_target", "La cadena IK contiene una pieza inexistente o una rotación inválida.");
        }
      } else if (effect.type === "set_expression") {
        if (!Array.isArray(effect.operations)) return fail("invalid_expression_preview", "La expresión no contiene operaciones verificables.");
        for (const operation of effect.operations) {
          const node = operation && nodes.get(String(operation.targetId));
          if (!node || !["rotation", "scale", "shape"].includes(operation.property)) return fail("unknown_expression_target", "La expresión contiene una pieza o propiedad no permitida.");
          if (operation.property === "shape") {
            if (typeof operation.value !== "string" || operation.value.length > 80) return fail("invalid_expression_shape", "La expresión contiene una forma no válida.");
          } else if (!finite(operation.value)) return fail("invalid_expression_value", "La expresión contiene un valor no finito.");
          node[operation.property] = operation.value;
        }
      } else {
        return fail("unsupported_preview_effect", "La vista previa no reconoce uno de los efectos propuestos.");
      }
    }
    return { ok: true, project: snapshot, mutatesSource: false, executionEnabled: false };
  };
  Object.defineProperty(window, "ADM_PreviewState", {
    configurable: false, enumerable: true, writable: false,
    value: Object.freeze({ version: "1.0.0", build })
  });
})();