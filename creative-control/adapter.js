/* ADM Creative Control — read-only editor adapter.
 * This first stage exposes a narrow, immutable snapshot only.
 * It does not execute creative actions or expose project objects.
 */
(() => {
  "use strict";

  const freezeDeep = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freezeDeep);
    return value;
  };

  const getContext = () => {
    const project = typeof data === "object" && data ? data : null;
    if (!project || !Array.isArray(project.nodes)) {
      return freezeDeep({ ok: false, error: "editor_context_unavailable" });
    }

    const selectedPart = project.nodes.find(node => node.id === selected) || null;
    const nodes = project.nodes.map(node => ({
      id: String(node.id),
      name: String(node.name || ""),
      type: String(node.type || ""),
      shape: node.shape == null ? null : String(node.shape),
      parent: node.parent == null ? null : String(node.parent),
      children: Array.isArray(node.children) ? node.children.map(String) : [],
      transform: {
        x: Number(node.x) || 0,
        y: Number(node.y) || 0,
        rotation: Number(node.rotation) || 0,
        scale: Number.isFinite(Number(node.scale)) ? Number(node.scale) : 1,
        rotationMin: Number.isFinite(Number(node.rotationMin)) ? Number(node.rotationMin) : -180,
        rotationMax: Number.isFinite(Number(node.rotationMax)) ? Number(node.rotationMax) : 180
      },
      hasMesh: !!node.mesh
    }));

    const poses = Array.isArray(project.poses) ? project.poses.map(pose => ({
      id: String(pose.id || ""),
      name: String(pose.name || "")
    })) : [];

    return freezeDeep({
      ok: true,
      adapterVersion: "0.1.0-readonly",
      project: {
        name: String(project.name || "Proyecto sin nombre"),
        version: Number(project.version) || 1
      },
      workspace: "character",
      selection: selectedPart ? { id: String(selectedPart.id), name: String(selectedPart.name || "") } : null,
      nodes,
      poses,
      counts: { nodes: nodes.length, poses: poses.length }
    });
  };

  const getCapabilities = () => freezeDeep({
    ok: true,
    adapterVersion: "0.1.0-readonly",
    mode: "read-only",
    capabilities: [
      { id: "inspect_project", access: "read", description: "Consultar resumen del proyecto y sus piezas." },
      { id: "inspect_selection", access: "read", description: "Consultar la pieza seleccionada y su transformación." },
      { id: "list_poses", access: "read", description: "Consultar las poses guardadas en el proyecto." }
    ],
    unavailableUntilApproved: [
      "set_part_transform",
      "apply_pose",
      "solve_ik",
      "set_expression",
      "create_pose",
      "scene_operations",
      "audio_operations",
      "timeline_operations"
    ]
  });

  Object.defineProperty(window, "ADM_CreativeControl", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: Object.freeze({
      version: "0.1.0-readonly",
      getContext,
      getCapabilities
    })
  });
})();
