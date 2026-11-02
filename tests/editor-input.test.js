"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../prototype/character-editor-v01/index.html"),"utf8");
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
