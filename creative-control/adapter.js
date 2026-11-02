/* ADM Creative Control — read-only synchronization adapter.
 * Exposes immutable editor snapshots and change notifications.
 * It never executes creative actions or exposes mutable project objects.
 */
(() => {
  "use strict";

  const PROTOCOL_VERSION = "1.0.0";
  const ADAPTER_VERSION = "0.2.0-readonly";
  let projectRevision = 0;
  let contextRevision = 0;
  let lastProjectFingerprint = null;
  let lastContextFingerprint = null;
  let lastEmittedContext = null;
  let lastCapabilitiesFingerprint = null;
  const listeners = new Set();
  let observer = null;

  const freezeDeep = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freezeDeep);
    return value;
  };

  const readRawContext = () => {
    const project = typeof data === "object" && data ? data : null;
    if (!project || !Array.isArray(project.nodes)) {
      return { ok: false, error: "editor_context_unavailable" };
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
        pivotX: Number(node.pivotX) || 0,
        pivotY: Number(node.pivotY) || 0,
        scale: Number.isFinite(Number(node.scale)) ? Number(node.scale) : 1,
        rotationMin: Number.isFinite(Number(node.rotationMin)) ? Number(node.rotationMin) : -180,
        rotationMax: Number.isFinite(Number(node.rotationMax)) ? Number(node.rotationMax) : 180
      },
      mesh: node.mesh ? {
        available: true,
        vertices: Array.isArray(node.mesh.vertices) ? node.mesh.vertices.length : 0,
        faces: Array.isArray(node.mesh.faces) ? node.mesh.faces.length : 0
      } : { available: false, vertices: 0, faces: 0 }
    }));

    const poses = Array.isArray(project.poses) ? project.poses.map(pose => ({
      id: String(pose.id || ""),
      name: String(pose.name || ""),
      nodeCount: Array.isArray(pose.nodes) ? pose.nodes.length : 0,
      nodes: Array.isArray(pose.nodes) ? pose.nodes.map(node => ({
        id: String(node.id || ""),
        x: Number.isFinite(Number(node.x)) ? Number(node.x) : null,
        y: Number.isFinite(Number(node.y)) ? Number(node.y) : null,
        rotation: Number.isFinite(Number(node.rotation)) ? Number(node.rotation) : null,
        scale: Number.isFinite(Number(node.scale)) ? Number(node.scale) : null,
        ...(typeof node.shape === "string" ? { shape: node.shape } : {})
      })) : []
    })) : [];

    return {
      ok: true,
      protocolVersion: PROTOCOL_VERSION,
      adapterVersion: ADAPTER_VERSION,
      project: {
        name: String(project.name || "Proyecto sin nombre"),
        formatVersion: Number(project.version) || 1,
        revision: projectRevision
      },
      workspace: {
        id: "character",
        available: ["character"],
        unavailable: ["rig", "animation", "scenes", "audio", "playlist", "timeline"]
      },
      selection: selectedPart ? {
        id: String(selectedPart.id),
        name: String(selectedPart.name || ""),
        type: String(selectedPart.type || "")
      } : null,
      resources: {
        rootId: project.root == null ? null : String(project.root),
        nodes,
        poses,
        counts: { nodes: nodes.length, poses: poses.length }
      }
    };
  };

  const fingerprint = value => JSON.stringify(value);

  const getContext = () => {
    const raw = readRawContext();
    if (!raw.ok) return freezeDeep(raw);

    // Fingerprint the complete serializable project privately so mesh vertices,
    // weights, pose values and future project resources also invalidate stale context.
    const nextProjectFingerprint = fingerprint(data);
    const nextContextFingerprint = fingerprint({
      project: nextProjectFingerprint,
      workspace: raw.workspace.id,
      selection: raw.selection && raw.selection.id
    });

    if (nextProjectFingerprint !== lastProjectFingerprint) {
      projectRevision += 1;
      lastProjectFingerprint = nextProjectFingerprint;
    }
    if (nextContextFingerprint !== lastContextFingerprint) {
      contextRevision += 1;
      lastContextFingerprint = nextContextFingerprint;
    }

    raw.project.revision = projectRevision;
    raw.contextRevision = contextRevision;
    return freezeDeep(raw);
  };

  const getCapabilities = () => {
    const registry = window.ADM_CapabilityRegistry;
    if (!registry || typeof registry.getCapabilities !== "function") {
      return freezeDeep({
        ok: false,
        protocolVersion: PROTOCOL_VERSION,
        adapterVersion: ADAPTER_VERSION,
        mode: "read-only",
        capabilities: [],
        error: "capability_registry_unavailable",
        execution: { enabled: false, approvalRequired: true }
      });
    }
    return freezeDeep({
      ok: true,
      protocolVersion: PROTOCOL_VERSION,
      adapterVersion: ADAPTER_VERSION,
      ...registry.getCapabilities(),
      execution: { enabled: false, approvalRequired: true }
    });
  };

  const validateProposal = proposal => {
    const validator = window.ADM_ProposalValidator;
    if (!validator || typeof validator.validate !== "function") {
      return freezeDeep({ ok: false, status: "validator_unavailable", errors: [{ code: "validator_unavailable", path: "validator", message: "El validador de propuestas no está disponible." }], effects: [], mutatesProject: false, executionEnabled: false });
    }
    return validator.validate(proposal, getContext());
  };

  const previewProposal = proposal => {
    const validation = validateProposal(proposal);
    if (!validation.ok) return freezeDeep({ ok: false, validation, preview: { ok: false, code: "proposal_not_valid", message: "La propuesta no superó la validación." }, mutatesProject: false, executionEnabled: false });
    const context = getContext();
    const renderer = window.ADM_EditorPreview;
    if (!renderer || typeof renderer.present !== "function") {
      return freezeDeep({ ok: false, validation, preview: { ok: false, code: "preview_renderer_unavailable", message: "El visor de propuestas no está disponible." }, mutatesProject: false, executionEnabled: false });
    }
    const preview = renderer.present(validation, context);
    return freezeDeep({ ok: !!preview.ok, validation, preview, mutatesProject: false, executionEnabled: false });
  };

  const clearPreview = () => {
    const renderer = window.ADM_EditorPreview;
    return renderer && typeof renderer.clear === "function"
      ? renderer.clear()
      : freezeDeep({ ok: false, code: "preview_renderer_unavailable" });
  };

  const getCapability = id => {
    const registry = window.ADM_CapabilityRegistry;
    return registry && typeof registry.getCapability === "function"
      ? registry.getCapability(id)
      : null;
  };

  const emitChanges = () => {
    const context = getContext();
    if (!context.ok) return;
    const previous = lastEmittedContext;
    const changes = [];
    if (!previous || previous.project.revision !== context.project.revision) changes.push("project.changed");
    if (!previous || previous.workspace.id !== context.workspace.id) changes.push("workspace.changed");
    const previousSelection = previous && previous.selection ? previous.selection.id : null;
    const nextSelection = context.selection ? context.selection.id : null;
    if (!previous || previousSelection !== nextSelection) changes.push("selection.changed");
    if (!previous || previous.contextRevision !== context.contextRevision) changes.push("context.changed");
    if (!changes.length) return;

    lastEmittedContext = context;
    const capabilities = getCapabilities();
    const nextCapabilitiesFingerprint = fingerprint(capabilities);
    if (nextCapabilitiesFingerprint !== lastCapabilitiesFingerprint) {
      lastCapabilitiesFingerprint = nextCapabilitiesFingerprint;
      changes.push("capabilities.changed");
    }
    for (const type of changes) {
      const event = freezeDeep({
        type,
        protocolVersion: PROTOCOL_VERSION,
        contextRevision: context.contextRevision,
        projectRevision: context.project.revision,
        context,
        capabilities
      });
      listeners.forEach(listener => {
        try { listener(event); } catch (_) { /* One subscriber cannot block others. */ }
      });
    }
  };

  const startObserving = () => {
    if (observer || typeof MutationObserver !== "function" || typeof document === "undefined") return;
    observer = new MutationObserver(emitChanges);
    ["art", "outline", "tree", "selectedLabel", "count", "type", "poseSelect"].forEach(id => {
      const target = document.getElementById(id);
      if (target) observer.observe(target, { childList: true, subtree: true, attributes: true, characterData: true });
    });
  };

  const subscribe = listener => {
    if (typeof listener !== "function") throw new TypeError("listener_must_be_function");
    listeners.add(listener);
    startObserving();
    emitChanges();
    return () => listeners.delete(listener);
  };

  Object.defineProperty(window, "ADM_CreativeControl", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: Object.freeze({
      protocolVersion: PROTOCOL_VERSION,
      version: ADAPTER_VERSION,
      getContext,
      getCapabilities,
      getCapability,
      validateProposal,
      previewProposal,
      clearPreview,
      subscribe
    })
  });
})();
