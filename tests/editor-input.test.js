"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../prototype/character-editor-v01/index.html"),"utf8");
const adapter=fs.readFileSync(path.join(__dirname,"../creative-control/adapter.js"),"utf8");

test("el lienzo usa Pointer Events para entrada unificada",()=>{
 assert.match(html,/\.onpointerdown\s*=/);
 assert.match(html,/\.onpointermove\s*=/);
 assert.match(html,/\.onpointerup\s*=/);
});
test("el lienzo limpia el arrastre al cancelar o perder captura",()=>{
 assert.match(html,/\.onpointercancel\s*=\(\)\s*=>\s*\{drag=null;\}/);
 assert.match(html,/\.onlostpointercapture\s*=\(\)\s*=>\s*\{drag=null;\}/);
});
test("la interfaz aumenta controles para dispositivos de puntero táctil",()=>{
 assert.match(html,/@media\s*\(pointer:\s*coarse\)/);
 assert.match(html,/button\{min-height:44px/);
});
test("la malla muestra un mapa de calor del peso del hueso seleccionado",()=>{
 assert.match(html,/data-weight=/);
 assert.match(html,/Math\.round\(weight\*100\)/);
 assert.match(html,/meshBone"\)\.onchange=\(\)=>\{meshStatusMessage="";render\(\);\}/);
});
test("los controles deshabilitados se distinguen visualmente y no parecen activos",()=>{
 assert.match(html,/button:disabled\s*\{[^}]*opacity:/);
 assert.match(html,/input:disabled,select:disabled\s*\{[^}]*opacity:/);
});
test("ADM Creative Control carga el adaptador de sincronización de solo lectura",()=>{
 assert.ok(html.includes('<script src="../../creative-control/adapter.js"></script>'));
 assert.ok(adapter.includes("getContext"));
 assert.ok(adapter.includes("getCapabilities"));
 assert.ok(adapter.includes("subscribe"));
 assert.ok(adapter.includes('mode: "read-only"'));
 assert.ok(adapter.includes("MutationObserver"));
 assert.ok(adapter.includes("Object.freeze"));
});
test("el contrato identifica revisiones de proyecto y contexto",()=>{
 assert.match(adapter,/projectRevision/);
 assert.match(adapter,/contextRevision/);
 assert.match(adapter,/"project\.changed"/);
 assert.match(adapter,/"selection\.changed"/);
 assert.match(adapter,/"workspace\.changed"/);
});
test("el adaptador no publica operaciones de escritura ni ejecución",()=>{
 for(const forbidden of ["commit:", "execute:", "applyPose:", "setTransform:", "deleteNode:"]) {
  assert.equal(adapter.includes(forbidden),false);
 }
 assert.match(adapter,/execution:\s*\{ enabled: false/);
});
