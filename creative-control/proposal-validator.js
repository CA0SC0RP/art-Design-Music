/* ADM Creative Proposal Validator — validates and simulates proposals without mutation. */
(() => {
  "use strict";

  const VERSION = "1.0.0";
  const EXPRESSIONS = {
    neutral: { browL: 0, browR: 0, mouth: "mouthNeutral", eye: 1 },
    happy: { browL: -8, browR: 8, mouth: "mouthSmile", eye: 0.9 },
    sad: { browL: 14, browR: -14, mouth: "mouthSad", eye: 1 },
    surprised: { browL: -18, browR: 18, mouth: "mouthOpen", eye: 1.1 },
    angry: { browL: 18, browR: -18, mouth: "mouthAngry", eye: 1 }
  };
  const IK_CHAINS = {
    armR: { upper: "armR", lower: "foreR", end: "handR" },
    armL: { upper: "armL", lower: "foreL", end: "handL" },
    legR: { upper: "legR", lower: "shinR", end: "footR" },
    legL: { upper: "legL", lower: "shinL", end: "footL" }
  };
  const isRecord = value => !!value && typeof value === "object" && !Array.isArray(value);
  const isFiniteNumber = value => typeof value === "number" && Number.isFinite(value);
  const onlyKeys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
  const freezeDeep = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freezeDeep);
    return value;
  };
  const nodeMap = context => new Map((context.resources.nodes || []).map(node => [node.id, node]));
  const addError = (errors, code, path, message) => errors.push({ code, path, message });

  const validate = (proposal, suppliedContext) => {
    const errors = [];
    const effects = [];
    const context = suppliedContext || (window.ADM_CreativeControl && window.ADM_CreativeControl.getContext());
    if (!context || context.ok === false || !context.project || !context.workspace || !context.resources) {
      return freezeDeep({ ok: false, status: "context_unavailable", validatorVersion: VERSION, errors: [{ code: "context_unavailable", path: "context", message: "El editor no proporcionó un contexto válido." }], effects: [], mutatesProject: false });
    }
    if (!isRecord(proposal)) {
      return freezeDeep({ ok: false, status: "invalid", validatorVersion: VERSION, errors: [{ code: "invalid_proposal", path: "proposal", message: "La propuesta debe ser un objeto JSON." }], effects: [], mutatesProject: false });
    }

    if (!onlyKeys(proposal, ["schemaVersion","proposalId","projectVersion","workspace","summary","assumptions","actions"])) {
      addError(errors, "unknown_property", "proposal", "La propuesta contiene propiedades no permitidas.");
    }
    if (proposal.schemaVersion !== "1.0") addError(errors, "unsupported_schema", "schemaVersion", "La versión debe ser 1.0.");
    if (typeof proposal.proposalId !== "string" || proposal.proposalId.length < 1 || proposal.proposalId.length > 100) addError(errors, "invalid_proposal_id", "proposalId", "proposalId debe contener entre 1 y 100 caracteres.");
    if (typeof proposal.projectVersion !== "string" || proposal.projectVersion.length < 1 || proposal.projectVersion.length > 120) {
      addError(errors, "invalid_project_version", "projectVersion", "projectVersion debe ser una cadena de 1 a 120 caracteres.");
    } else if (proposal.projectVersion !== String(context.project.revision)) {
      addError(errors, "stale_project", "projectVersion", "El proyecto cambió desde que se preparó la propuesta. Solicita una propuesta con el contexto actualizado.");
    }
    if (proposal.workspace !== context.workspace.id) addError(errors, "workspace_mismatch", "workspace", "La propuesta no corresponde al espacio de trabajo activo.");
    if (typeof proposal.summary !== "string" || proposal.summary.length < 1 || proposal.summary.length > 500) addError(errors, "invalid_summary", "summary", "summary debe contener entre 1 y 500 caracteres.");
    if (proposal.assumptions !== undefined && (!Array.isArray(proposal.assumptions) || proposal.assumptions.length > 20 || proposal.assumptions.some(item => typeof item !== "string" || item.length > 300))) {
      addError(errors, "invalid_assumptions", "assumptions", "assumptions admite hasta 20 cadenas de 300 caracteres.");
    }
    if (!Array.isArray(proposal.actions) || proposal.actions.length < 1 || proposal.actions.length > 50) {
      addError(errors, "invalid_actions", "actions", "La propuesta debe contener entre 1 y 50 acciones.");
    }

    const nodes = nodeMap(context);
    const poses = new Map((context.resources.poses || []).map(pose => [pose.id, pose]));
    const actions = Array.isArray(proposal.actions) ? proposal.actions : [];

    actions.forEach((action, index) => {
      const path = "actions[" + index + "]";
      if (!isRecord(action) || typeof action.type !== "string") {
        addError(errors, "invalid_action", path, "Cada acción debe ser un objeto con un tipo reconocido.");
        return;
      }

      if (action.type === "set_part_transform") {
        if (!onlyKeys(action, ["type","targetId","transform"])) addError(errors, "unknown_property", path, "La acción contiene propiedades no permitidas.");
        const node = typeof action.targetId === "string" ? nodes.get(action.targetId) : null;
        if (!node) { addError(errors, "unknown_target", path + ".targetId", "La pieza destino no existe en el proyecto activo."); return; }
        if (action.targetId === context.resources.rootId) addError(errors, "root_transform_forbidden", path + ".targetId", "La raíz no se puede transformar desde esta operación.");
        if (!isRecord(action.transform) || !onlyKeys(action.transform, ["x","y","rotation","scale"]) || Object.keys(action.transform).length === 0) {
          addError(errors, "invalid_transform", path + ".transform", "transform debe contener al menos un parámetro permitido y no aceptar campos adicionales.");
          return;
        }
        const before = node.transform || {};
        const after = { x: before.x, y: before.y, rotation: before.rotation, scale: before.scale };
        for (const [key, value] of Object.entries(action.transform)) {
          if (!isFiniteNumber(value)) { addError(errors, "invalid_number", path + ".transform." + key, "El valor debe ser un número finito."); continue; }
          if ((key === "x" || key === "y") && (value < -1000 || value > 1000)) addError(errors, "out_of_range", path + ".transform." + key, "La posición debe estar entre -1000 y 1000.");
          if (key === "scale" && (value < 0.05 || value > 10)) addError(errors, "out_of_range", path + ".transform.scale", "La escala debe estar entre 0.05 y 10.");
          if (key === "rotation" && (value < Number(before.rotationMin ?? -180) || value > Number(before.rotationMax ?? 180))) addError(errors, "joint_limit", path + ".transform.rotation", "La rotación excede los límites de esta articulación.");
          after[key] = value;
        }
        effects.push({ type: action.type, targetId: action.targetId, before, after, preview: "transform" });
        return;
      }

      if (action.type === "apply_pose") {
        if (!onlyKeys(action, ["type","poseId"])) addError(errors, "unknown_property", path, "La acción contiene propiedades no permitidas.");
        const pose = typeof action.poseId === "string" ? poses.get(action.poseId) : null;
        if (!pose) {
          addError(errors, "unknown_pose", path + ".poseId", "La pose solicitada no existe en el proyecto activo.");
          return;
        }
        const poseNodes = Array.isArray(pose.nodes) ? pose.nodes : [];
        if (!poseNodes.length) addError(errors, "pose_data_unavailable", path + ".poseId", "La pose no contiene transformaciones disponibles para previsualizar.");
        const previewNodes = [];
        poseNodes.forEach((poseNode, poseIndex) => {
          const posePath = path + ".pose.nodes[" + poseIndex + "]";
          const node = poseNode && typeof poseNode.id === "string" ? nodes.get(poseNode.id) : null;
          if (!node) { addError(errors, "unknown_pose_target", posePath + ".id", "La pose referencia una pieza que no existe en el proyecto activo."); return; }
          if (poseNode.id === context.resources.rootId) { addError(errors, "root_pose_target", posePath + ".id", "La pose no puede transformar la raíz."); return; }
          const values = {};
          for (const key of ["x","y","rotation","scale"]) {
            const value = poseNode[key];
            if (!isFiniteNumber(value)) addError(errors, "invalid_pose_value", posePath + "." + key, "La pose contiene un valor numérico no válido.");
            else values[key] = value;
          }
          if (isFiniteNumber(values.x) && (values.x < -1000 || values.x > 1000)) addError(errors, "out_of_range", posePath + ".x", "La posición debe estar entre -1000 y 1000.");
          if (isFiniteNumber(values.y) && (values.y < -1000 || values.y > 1000)) addError(errors, "out_of_range", posePath + ".y", "La posición debe estar entre -1000 y 1000.");
          if (isFiniteNumber(values.scale) && (values.scale < 0.05 || values.scale > 10)) addError(errors, "out_of_range", posePath + ".scale", "La escala debe estar entre 0.05 y 10.");
          if (isFiniteNumber(values.rotation) && (values.rotation < Number(node.transform.rotationMin ?? -180) || values.rotation > Number(node.transform.rotationMax ?? 180))) addError(errors, "joint_limit", posePath + ".rotation", "La pose excede los límites de esta articulación.");
          if (poseNode.shape !== undefined) {
            const faceShapes = ["mouthNeutral","mouthSmile","mouthSad","mouthOpen","mouthAngry"];
            if (typeof poseNode.shape !== "string" || (poseNode.shape !== node.shape && !faceShapes.includes(poseNode.shape))) addError(errors, "invalid_pose_shape", posePath + ".shape", "La pose contiene una forma no admitida para esta pieza.");
            else values.shape = poseNode.shape;
          }
          previewNodes.push({ id: poseNode.id, ...values });
        });
        effects.push({ type: action.type, poseId: action.poseId, nodes: previewNodes, affectedParts: previewNodes.length, preview: "pose" });
        return;
      }

      if (action.type === "solve_ik") {
        if (!onlyKeys(action, ["type","chainId","target","bend"])) addError(errors, "unknown_property", path, "La acción contiene propiedades no permitidas.");
        const chain = IK_CHAINS[action.chainId];
        if (!chain) { addError(errors, "unknown_chain", path + ".chainId", "La cadena IK no está disponible."); return; }
        const upper = nodes.get(chain.upper), lower = nodes.get(chain.lower), end = nodes.get(chain.end), torso = nodes.get("torso");
        if (!upper || !lower || !end || !torso) { addError(errors, "missing_chain", path + ".chainId", "La cadena IK requiere torso, segmento superior, inferior y extremo."); return; }
        if (!isRecord(action.target) || !onlyKeys(action.target, ["x","y"]) || !isFiniteNumber(action.target.x) || !isFiniteNumber(action.target.y)) {
          addError(errors, "invalid_ik_target", path + ".target", "El objetivo IK debe contener coordenadas x e y finitas.");
          return;
        }
        if (Math.abs(action.target.x) > 1000 || Math.abs(action.target.y) > 1000) addError(errors, "out_of_range", path + ".target", "El objetivo IK debe estar entre -1000 y 1000 en ambos ejes.");
        if (action.bend !== undefined && action.bend !== -1 && action.bend !== 1) addError(errors, "invalid_bend", path + ".bend", "bend debe ser -1 o 1.");
        const segments = [upper, lower, end];
        const neutral = segments.every(node => Math.abs(Number(node.transform.pivotX) || 0) < 0.001 && Math.abs(Number(node.transform.pivotY) || 0) < 0.001 && Math.abs((Number(node.transform.scale) || 1) - 1) < 0.001);
        if (!neutral || Math.abs(Number(lower.transform.x) || 0) > 0.5 || Math.abs(Number(end.transform.x) || 0) > 0.5) {
          addError(errors, "ik_precondition", path + ".chainId", "Esta versión de IK requiere pivotes neutros, escala 1 y segmentos alineados.");
          return;
        }
        let solution = null;
        if (window.ADM_IK && typeof window.ADM_IK.solveTwoBone === "function") {
          solution = window.ADM_IK.solveTwoBone({
            length1: Math.hypot(lower.transform.x, lower.transform.y),
            length2: Math.hypot(end.transform.x, end.transform.y),
            targetX: action.target.x - upper.transform.x,
            targetY: action.target.y - upper.transform.y,
            bend: action.bend === undefined ? 1 : action.bend,
            upperMin: Math.max(-165, upper.transform.rotationMin ?? -180),
            upperMax: Math.min(165, upper.transform.rotationMax ?? 180),
            lowerMin: Math.max(-150, lower.transform.rotationMin ?? -180),
            lowerMax: Math.min(150, lower.transform.rotationMax ?? 180)
          });
        }
        if (!solution || !solution.ok) addError(errors, "ik_unsolved", path, solution && solution.message ? solution.message : "El solver IK no está disponible para simular esta cadena.");
        else effects.push({ type: action.type, chainId: action.chainId, target: action.target, rotations: { [chain.upper]: solution.upperDeg, [chain.lower]: solution.lowerDeg, [chain.end]: 0 }, preview: "ik-solution" });
        return;
      }

      if (action.type === "set_expression") {
        if (!onlyKeys(action, ["type","expression"])) addError(errors, "unknown_property", path, "La acción contiene propiedades no permitidas.");
        const expression = EXPRESSIONS[action.expression];
        if (!expression) { addError(errors, "unknown_expression", path + ".expression", "La expresión no pertenece al catálogo del editor."); return; }
        const required = ["mouth","browL","browR"];
        if (required.some(id => !nodes.has(id))) { addError(errors, "missing_face", path + ".expression", "El personaje no contiene las piezas faciales necesarias."); return; }
        const operations = [
          { targetId: "browL", property: "rotation", value: expression.browL },
          { targetId: "browR", property: "rotation", value: expression.browR },
          { targetId: "mouth", property: "shape", value: expression.mouth }
        ];
        ["eyeL","eyeR"].forEach(id => { if (nodes.has(id)) operations.push({ targetId: id, property: "scale", value: expression.eye }); });
        effects.push({ type: action.type, expression: action.expression, operations, preview: "expression" });
        return;
      }

      addError(errors, "unsupported_action", path + ".type", "El tipo de acción no está admitido por el contrato actual.");
    });

    const ok = errors.length === 0;
    return freezeDeep({
      ok,
      status: ok ? "valid" : (errors.some(error => error.code === "stale_project") ? "stale" : "invalid"),
      validatorVersion: VERSION,
      proposalId: typeof proposal.proposalId === "string" ? proposal.proposalId : null,
      projectVersion: proposal.projectVersion ?? null,
      workspace: proposal.workspace ?? null,
      actionCount: actions.length,
      errors,
      effects: ok ? effects : [],
      mutatesProject: false,
      executionEnabled: false
    });
  };

  Object.defineProperty(window, "ADM_ProposalValidator", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: Object.freeze({ version: VERSION, validate })
  });
})();
