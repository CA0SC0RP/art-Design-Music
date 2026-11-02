/* ADM Creative Capability Registry — descriptive, read-only catalog.
 * It reports existing editor support; it does not invoke handlers or mutate projects.
 */
(() => {
  "use strict";

  const PROTOCOL_VERSION = "1.0.0";
  const REGISTRY_VERSION = "1.0.1";
  const freezeDeep = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freezeDeep);
    return value;
  };
  const has = id => !!document.getElementById(id);
  const hasAll = ids => ids.every(has);
  const fn = name => typeof window[name] === "function";
  const nodeIds = () => new Set(Array.isArray(data && data.nodes) ? data.nodes.map(node => node.id) : []);
  const hasAnyIKChain = () => {
    const ids = nodeIds();
    return [["armR","foreR","handR"],["armL","foreL","handL"],["legR","shinR","footR"],["legL","shinL","footL"]].some(chain => chain.every(id => ids.has(id)));
  };
  const hasFacialParts = () => {
    const ids = nodeIds();
    return ["mouth","browL","browR"].every(id => ids.has(id));
  };
  const hasCoordinatedParts = () => {
    const ids = nodeIds();
    return ["armR","foreR","handR","armL","foreL","handL","legL","shinL","footL","legR","shinR","footR"].every(id => ids.has(id));
  };
  const selectedNode = () => {
    try { return data.nodes.find(node => node.id === selected) || null; }
    catch (_) { return null; }
  };

  const definitions = [
    {
      id: "inspect_project", title: "Consultar proyecto", category: "inspection",
      access: "read", proposalSupported: false, support: "native-read",
      controls: [], preconditions: ["El proyecto debe estar cargado."],
      impact: "Ninguno; solo lectura.", reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: {} },
      available: () => Array.isArray(data && data.nodes)
    },
    {
      id: "inspect_selection", title: "Consultar selección", category: "inspection",
      access: "read", proposalSupported: false, support: "native-read",
      controls: [], preconditions: ["Debe existir una pieza seleccionada."],
      impact: "Ninguno; solo lectura.", reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: {} },
      available: () => !!selectedNode()
    },
    {
      id: "list_poses", title: "Consultar biblioteca de poses", category: "inspection",
      access: "read", proposalSupported: false, support: "native-read",
      controls: ["poseSelect"], preconditions: ["El proyecto debe estar cargado."],
      impact: "Ninguno; solo lectura.", reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: {} },
      available: () => has("poseSelect") && Array.isArray(data && data.poses)
    },
    {
      id: "inspect_mesh", title: "Consultar malla", category: "inspection",
      access: "read", proposalSupported: false, support: "native-read",
      controls: ["meshBone"], preconditions: ["Debe existir una pieza con malla para consultar geometría."],
      impact: "Ninguno; solo lectura.", reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: {} },
      available: () => has("meshBone") && !!selectedNode()
    },
    {
      id: "set_part_transform", proposalActionType: "set_part_transform", title: "Ajustar transformación de pieza", category: "transform",
      access: "proposal", proposalSupported: true, support: "manual-editor-controls",
      controls: ["x", "y", "rot", "scale"], preconditions: ["Debe haber una pieza no raíz seleccionada.", "La rotación respeta los límites de articulación de la pieza."],
      impact: "Modifica posición, rotación o escala de la pieza seleccionada.",
      reversible: true,
      parameters: {
        type: "object", additionalProperties: false, minProperties: 1,
        properties: {
          x: { type: "number" }, y: { type: "number" },
          rotation: { type: "number" }, scale: { type: "number", exclusiveMinimum: 0 }
        }
      },
      available: () => hasAll(["x", "y", "rot", "scale"]) && !!selectedNode() && selectedNode().id !== data.root
    },
    {
      id: "apply_pose", proposalActionType: "apply_pose", title: "Aplicar pose guardada", category: "pose",
      access: "proposal", proposalSupported: true, support: "editor-function",
      controls: ["poseSelect", "applyPose"], preconditions: ["La pose debe existir en el proyecto.", "La pose debe referirse a piezas compatibles."],
      impact: "Modifica transformaciones y, si corresponde, formas de las piezas incluidas en la pose.",
      reversible: true,
      parameters: {
        type: "object", additionalProperties: false, required: ["poseId"],
        properties: { poseId: { type: "string", minLength: 1 }, transitionMs: { type: "integer", minimum: 0, maximum: 30000 } }
      },
      available: () => hasAll(["poseSelect", "applyPose"]) && fn("applyPose") && Array.isArray(data && data.poses) && data.poses.length > 0
    },
    {
      id: "solve_ik", proposalActionType: "solve_ik", title: "Resolver cadena IK", category: "rig",
      access: "proposal", proposalSupported: true, support: "editor-function",
      controls: ["ikChain", "ikX", "ikY", "ikBend", "solveIK"],
      preconditions: ["La cadena debe existir en el preset Personaje.", "Los segmentos deben tener pivotes neutros, escala 1 y estar alineados.", "El objetivo debe estar dentro del alcance y los límites articulares."],
      impact: "Modifica la rotación de los segmentos de la cadena seleccionada.",
      reversible: true,
      parameters: {
        type: "object", additionalProperties: false, required: ["chainId", "target"],
        properties: {
          chainId: { enum: ["armR", "armL", "legR", "legL"] },
          target: { type: "object", additionalProperties: false, required: ["x", "y"], properties: { x: { type: "number" }, y: { type: "number" } } },
          bend: { enum: [-1, 1] }
        }
      },
      available: () => hasAll(["ikChain", "ikX", "ikY", "ikBend", "solveIK"]) && fn("solveIKAt") && hasAnyIKChain()
    },
    {
      id: "set_expression", proposalActionType: "set_expression", title: "Aplicar expresión facial", category: "expression",
      access: "proposal", proposalSupported: true, support: "editor-function",
      controls: ["expressionSelect", "applyExpression"],
      preconditions: ["El personaje debe tener boca y cejas compatibles.", "La expresión debe pertenecer al catálogo del editor."],
      impact: "Modifica rotación de cejas, forma de boca y escala de ojos.",
      reversible: true,
      parameters: {
        type: "object", additionalProperties: false, required: ["expression"],
        properties: { expression: { enum: ["neutral", "happy", "sad", "surprised", "angry"] } }
      },
      available: () => hasAll(["expressionSelect", "applyExpression"]) && fn("applyExpression") && hasFacialParts()
    },
    {
      id: "run_coordinated_action", title: "Aplicar movimiento coordinado predefinido", category: "motion",
      access: "manual", proposalSupported: false, support: "editor-function",
      controls: ["actionWave", "actionWalkA", "actionWalkB", "actionRest"],
      preconditions: ["Debe estar cargado el preset Personaje.", "Todas las piezas requeridas por la acción deben existir."],
      impact: "Aplica una pose coordinada mediante transición.",
      reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: { actionId: { enum: ["wave", "walk_a", "walk_b", "rest"] } } },
      available: () => hasAll(["actionWave", "actionWalkA", "actionWalkB", "actionRest"]) && fn("runCoordinatedAction") && hasCoordinatedParts()
    },
    {
      id: "create_mesh", title: "Crear malla", category: "mesh",
      access: "manual", proposalSupported: false, support: "manual-ui-handler",
      controls: ["meshCreate"], preconditions: ["Debe haber una pieza no raíz seleccionada.", "La geometría debe ser compatible con la generación de malla."],
      impact: "Añade una malla editable a la pieza seleccionada.",
      reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: {} },
      available: () => has("meshCreate") && !!selectedNode() && selectedNode().id !== data.root
    },
    {
      id: "edit_mesh_weights", title: "Editar pesos de malla", category: "mesh",
      access: "manual", proposalSupported: false, support: "manual-ui-handler",
      controls: ["meshPaint", "meshAssign", "meshBone", "meshWeight", "meshBrush", "meshBrushMode"],
      preconditions: ["La pieza seleccionada debe tener malla.", "El hueso destino debe existir.", "Los pesos deben poder normalizarse."],
      impact: "Modifica influencias de vértices sobre huesos.",
      reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: {} },
      available: () => hasAll(["meshPaint", "meshAssign", "meshBone", "meshWeight", "meshBrush", "meshBrushMode"]) && !!selectedNode() && !!selectedNode().mesh
    },
    {
      id: "add_part", title: "Añadir pieza", category: "hierarchy",
      access: "manual", proposalSupported: false, support: "manual-ui-handler",
      controls: ["[data-add]"], preconditions: ["Debe existir una jerarquía compatible."],
      impact: "Añade una pieza a la jerarquía del proyecto.",
      reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: { partType: { enum: ["arm", "leg", "branch", "leaf", "joint"] } } },
      available: () => document.querySelectorAll("[data-add]").length > 0
    },
    {
      id: "select_part", title: "Seleccionar pieza", category: "selection",
      access: "manual", proposalSupported: false, support: "manual-ui-handler",
      controls: ["tree", "scene"], preconditions: ["La pieza debe existir en la jerarquía."],
      impact: "Cambia la selección activa del editor.",
      reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: { targetId: { type: "string", minLength: 1 } } },
      available: () => has("tree") && has("scene") && Array.isArray(data && data.nodes) && data.nodes.length > 0
    },
    {
      id: "duplicate_part", title: "Duplicar pieza", category: "hierarchy",
      access: "manual", proposalSupported: false, support: "manual-ui-handler",
      controls: ["duplicate"], preconditions: ["Debe haber una pieza no raíz seleccionada."],
      impact: "Duplica la pieza seleccionada y su subárbol, según las reglas del editor.",
      reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: {} },
      available: () => has("duplicate") && !!selectedNode() && selectedNode().id !== data.root
    },
    {
      id: "reparent_part", title: "Cambiar pieza de padre", category: "hierarchy",
      access: "manual", proposalSupported: false, support: "manual-ui-handler",
      controls: ["parent"], preconditions: ["No se permiten ciclos ni asignar un descendiente como padre."],
      impact: "Cambia la jerarquía y conserva la transformación mundial mediante la geometría del rig.",
      reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: { parentId: { type: "string" } } },
      available: () => has("parent") && !!selectedNode() && selectedNode().id !== data.root
    },
    {
      id: "delete_part", title: "Eliminar pieza", category: "hierarchy",
      access: "manual", proposalSupported: false, support: "manual-ui-handler",
      controls: ["delete"], preconditions: ["Debe haber una pieza no raíz seleccionada.", "Se elimina también su subárbol."],
      impact: "Elimina una pieza y sus descendientes.",
      reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: {} },
      available: () => has("delete") && !!selectedNode() && selectedNode().id !== data.root
    },
    {
      id: "save_pose", title: "Guardar pose actual", category: "pose",
      access: "manual", proposalSupported: false, support: "manual-ui-handler",
      controls: ["poseName", "savePose"], preconditions: ["Debe escribirse un nombre de pose."],
      impact: "Añade una pose al proyecto.",
      reversible: true,
      parameters: { type: "object", additionalProperties: false, properties: { name: { type: "string", minLength: 1, maxLength: 100 } } },
      available: () => hasAll(["poseName", "savePose"])
    },
    {
      id: "import_export_project", title: "Importar y exportar proyecto", category: "project-io",
      access: "manual", proposalSupported: false, support: "manual-ui-handler",
      controls: ["import", "export", "save"], preconditions: ["La importación valida el formato del proyecto."],
      impact: "Lee o guarda archivos/proyecto local.",
      reversible: false,
      parameters: { type: "object", additionalProperties: false, properties: {} },
      available: () => hasAll(["import", "export", "save"])
    }
  ];

  const describe = definition => {
    let available = false;
    try { available = !!definition.available(); } catch (_) { available = false; }
    return {
      id: definition.id,
      title: definition.title,
      workspace: "character",
      category: definition.category,
      access: definition.access,
      available,
      proposalSupported: definition.proposalSupported,
      proposalActionType: definition.proposalActionType || null,
      agentExecutionEnabled: false,
      support: definition.support,
      controls: definition.controls,
      preconditions: definition.preconditions,
      impact: definition.impact,
      reversible: definition.reversible,
      parameters: definition.parameters,
      unavailableReason: available ? null : "missing_control_or_precondition"
    };
  };

  const getCapabilities = () => freezeDeep({
    protocolVersion: PROTOCOL_VERSION,
    registryVersion: REGISTRY_VERSION,
    workspace: "character",
    mode: "descriptive-only",
    execution: { enabled: false, approvalRequired: true },
    summary: {
      total: definitions.length,
      available: definitions.filter(item => { try { return !!item.available(); } catch (_) { return false; } }).length,
      proposalSupported: definitions.filter(item => item.proposalSupported).length
    },
    capabilities: definitions.map(describe)
  });

  const getCapability = id => {
    const definition = definitions.find(item => item.id === id);
    return definition ? freezeDeep(describe(definition)) : null;
  };

  Object.defineProperty(window, "ADM_CapabilityRegistry", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: Object.freeze({
      protocolVersion: PROTOCOL_VERSION,
      version: REGISTRY_VERSION,
      getCapabilities,
      getCapability
    })
  });
})();
