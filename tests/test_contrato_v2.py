"""Pruebas del contrato v2 de Cuadro Vivo (works/work.schema.json).

NO es el validador del proyecto (ver docs/plan-de-validacion-automatica.md).
Separa tres cosas para no confundirlas:

  1. Reglas que impone el ESQUEMA: se prueban ejecutando el esquema real.
     (nombres de prueba: test_esquema_*)
  2. Reglas que JSON Schema NO puede expresar (sumar x+width, comparar
     opacity.min con opacity.max): aquí solo hay una comprobación de
     REFERENCIA mínima para fijar el comportamiento esperado; el validador
     real, cuando se implemente, debe cumplir estas mismas pruebas.
     (nombres de prueba: test_ref_*)
  3. Reglas del plan todavía SIN implementar: aparecen como pruebas OMITIDAS
     ("skipped") con el motivo. No se ejecuta nada para ellas.

Uso:  python3 -I tests/test_contrato_v2.py -v
Requiere: Python 3 y el paquete jsonschema. Sin imágenes, sin red.
"""
import copy
import datetime
import hashlib
import json
import re
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
SCHEMA = json.loads((ROOT / "works/work.schema.json").read_text(encoding="utf-8"))
CONTRATO = (ROOT / "docs/contrato-de-capas-y-work-json.md").read_text(encoding="utf-8")
EJEMPLO = json.loads(re.findall(r"```json\n(.*?)\n```", CONTRATO, re.S)[0])
VALIDATOR = Draft202012Validator(SCHEMA)

CANVAS_W, CANVAS_H = 3840, 2160
FIXTURE_APPROVAL = {"by": "usuario", "date": "2026-10-26", "evidence": "FIXTURE DE PRUEBA, no es una aprobación real"}
FIXTURE_FILE_APPROVAL = dict(FIXTURE_APPROVAL, fileSha256="1" * 64)
QUIET = {"band": "none", "amount": 0}


def schema_errors(doc):
    return list(VALIDATOR.iter_errors(doc))


def fresh():
    return copy.deepcopy(EJEMPLO)


def layer(doc, layer_id):
    return next(l for l in doc["layers"] if l["id"] == layer_id)


# ---------------------------------------------------------------------------
# Comprobaciones de REFERENCIA (reglas que el esquema no puede expresar).
# No son el validador: solo fijan el comportamiento esperado.
# ---------------------------------------------------------------------------
def iter_rects(doc):
    """Todo rectángulo del documento: placement, alphaBounds, region, visibleWindow."""
    vw = doc["frame"].get("visibleWindow")
    if vw:
        yield "frame.visibleWindow", vw
    for l in doc["layers"]:
        for name in ("placement", "alphaBounds"):
            if l.get(name):
                yield f"layers[{l['id']}].{name}", l[name]
        for z in l["reconstruction"]["zones"]:
            if z.get("region"):
                yield f"layers[{l['id']}].zones[{z['id']}].region", z["region"]


def ref_rects_out_of_canvas(doc):
    """GEO-1: x+width <= 3840 e y+height <= 2160 para todo rectángulo."""
    return [p for p, r in iter_rects(doc)
            if r["x"] + r["width"] > CANVAS_W or r["y"] + r["height"] > CANVAS_H]


def ref_opacity_min_gt_max(doc):
    """MOV-10: opacity.min <= opacity.max."""
    return [l["id"] for l in doc["layers"] for c in l["motion"]["channels"]
            if c["channel"] == "opacity" and c["min"] > c["max"]]


# ---------------------------------------------------------------------------
# Punto 2: fechas reales de calendario
# ---------------------------------------------------------------------------
class FechasReales(unittest.TestCase):
    PATTERN = re.compile(SCHEMA["$defs"]["date"]["pattern"])

    def test_esquema_patron_coincide_con_calendario_en_todos_los_dias_1_a_9999(self):
        """Compara el patrón con datetime.date para cada (año, mes, día 1..31) de 0001 a 9999."""
        bad = []
        n = 0
        for y in range(1, 10000):
            for m in range(1, 13):
                for d in range(1, 32):
                    s = f"{y:04d}-{m:02d}-{d:02d}"
                    try:
                        datetime.date(y, m, d)
                        real = True
                    except ValueError:
                        real = False
                    n += 1
                    if bool(self.PATTERN.search(s)) != real:
                        bad.append((s, real))
        self.assertEqual(bad[:5], [], f"discrepancias con el calendario ({len(bad)} de {n})")

    def test_esquema_patron_rechaza_el_ano_0000(self):
        self.assertIsNone(self.PATTERN.search("0000-01-01"))

    def _doc_con_fecha(self, fecha):
        doc = fresh()
        layer(doc, "sky")["measurement"]["date"] = fecha
        return doc

    def test_esquema_acepta_fechas_reales(self):
        for f in ("2026-10-26", "2028-02-29", "2000-02-29", "2026-12-31", "2026-04-30"):
            with self.subTest(f=f):
                self.assertEqual(schema_errors(self._doc_con_fecha(f)), [])

    def test_esquema_rechaza_fechas_inexistentes_o_mal_formadas(self):
        for f in ("2026-02-29", "2100-02-29", "2026-02-30", "2026-04-31", "2026-06-31",
                  "2026-13-01", "2026-00-10", "2026-10-00", "2026-10-32", "0000-01-01",
                  "2026-1-5", "20261026", "2026-10-26T00:00", "2026-10-26\n", " 2026-10-26",
                  "26-10-2026", ""):
            with self.subTest(f=f):
                self.assertNotEqual(schema_errors(self._doc_con_fecha(f)), [])

    def test_esquema_aplica_a_aprobaciones_y_a_mediciones_de_zona_y_marco(self):
        doc = fresh()
        layer(doc, "sky").update(status="aprobado", approval=dict(FIXTURE_FILE_APPROVAL, date="2026-02-30"))
        self.assertNotEqual(schema_errors(doc), [])
        doc = fresh()
        layer(doc, "deer")["reconstruction"]["zones"][0]["measurement"]["date"] = "2026-04-31"
        self.assertNotEqual(schema_errors(doc), [])
        doc = fresh()
        doc["frame"].update(visibleWindow={"x": 200, "y": 180, "width": 3400, "height": 1700},
                            measurement=dict(layer(doc, "sky")["measurement"], date="2026-02-29"))
        self.assertNotEqual(schema_errors(doc), [])


# ---------------------------------------------------------------------------
# Punto 1: rectángulos dentro del lienzo (regla del validador, GEO-1)
# ---------------------------------------------------------------------------
class RectangulosDentroDelLienzo(unittest.TestCase):
    def test_esquema_solo_no_detecta_la_suma_limitacion_documentada(self):
        """El esquema acepta x=3700, width=300 (suma 4000 > 3840): por eso existe GEO-1."""
        doc = fresh()
        layer(doc, "deer")["placement"] = {"x": 3700, "y": 1000, "width": 300, "height": 380}
        self.assertEqual(schema_errors(doc), [])
        self.assertEqual(ref_rects_out_of_canvas(doc), ["layers[deer].placement"])

    def test_ref_ejemplo_del_contrato_no_excede_el_lienzo(self):
        self.assertEqual(ref_rects_out_of_canvas(fresh()), [])

    def test_ref_limite_exacto_es_valido_y_un_pixel_mas_no(self):
        doc = fresh()
        deer = layer(doc, "deer")
        deer["placement"] = {"x": 3540, "y": 1780, "width": 300, "height": 380}  # 3840 y 2160 exactos
        self.assertEqual(ref_rects_out_of_canvas(doc), [])
        deer["placement"]["x"] = 3541
        self.assertEqual(ref_rects_out_of_canvas(doc), ["layers[deer].placement"])
        deer["placement"] = {"x": 3540, "y": 1781, "width": 300, "height": 380}
        self.assertEqual(ref_rects_out_of_canvas(doc), ["layers[deer].placement"])

    def test_ref_se_aplica_a_alphabounds_region_y_visiblewindow(self):
        doc = fresh()
        layer(doc, "deer")["alphaBounds"] = {"x": 3800, "y": 1000, "width": 100, "height": 100}
        layer(doc, "deer")["reconstruction"]["zones"][0]["region"] = {"x": 100, "y": 2100, "width": 50, "height": 100}
        doc["frame"]["visibleWindow"] = {"x": 200, "y": 180, "width": 3700, "height": 1700}
        self.assertEqual(
            sorted(ref_rects_out_of_canvas(doc)),
            sorted(["layers[deer].alphaBounds", "layers[deer].zones[behind-deer].region", "frame.visibleWindow"]),
        )


# ---------------------------------------------------------------------------
# Punto 3: opacity.min <= opacity.max (regla del validador, MOV-10)
# ---------------------------------------------------------------------------
class OpacidadMinMax(unittest.TestCase):
    def _doc_con_opacidad(self, lo, hi):
        doc = fresh()
        layer(doc, "sky")["kind"] = "mist"
        layer(doc, "sky")["motion"] = {"channels": [
            {"channel": "opacity", "type": "pulse", "min": lo, "max": hi, "speedHz": 0.02, "phaseRad": 0, "audio": QUIET}]}
        return doc

    def test_esquema_solo_no_detecta_min_mayor_que_max_limitacion_documentada(self):
        doc = self._doc_con_opacidad(0.9, 0.7)
        self.assertEqual(schema_errors(doc), [])

    def test_ref_min_mayor_que_max_se_detecta(self):
        self.assertEqual(ref_opacity_min_gt_max(self._doc_con_opacidad(0.9, 0.7)), ["sky"])

    def test_ref_min_menor_o_igual_que_max_es_valido(self):
        for lo, hi in ((0.7, 0.9), (0.8, 0.8), (0.5, 1)):
            with self.subTest(lo=lo, hi=hi):
                self.assertEqual(ref_opacity_min_gt_max(self._doc_con_opacidad(lo, hi)), [])

    def test_esquema_sigue_limitando_cada_campo_a_0_5_1(self):
        self.assertNotEqual(schema_errors(self._doc_con_opacidad(0.4, 0.9)), [])
        self.assertNotEqual(schema_errors(self._doc_con_opacidad(0.6, 1.1)), [])


# ---------------------------------------------------------------------------
# Punto 4: capa móvil declara reconstrucción; safeBounds exige zonas aprobadas
# (reglas que sí impone el esquema)
# ---------------------------------------------------------------------------
class ReconstruccionYSafeBounds(unittest.TestCase):
    @staticmethod
    def _aprobar_zona(doc):
        z = layer(doc, "deer")["reconstruction"]["zones"][0]
        z.update(status="aprobado", approval=dict(FIXTURE_APPROVAL))
        return z

    def test_esquema_ejemplo_base_valido(self):
        self.assertEqual(schema_errors(fresh()), [])

    def test_esquema_safebounds_positivo_con_zona_en_revision_se_rechaza(self):
        for sb in ({"xPx": 2, "yPx": 0}, {"xPx": 0, "yPx": 3}, {"xPx": 2, "yPx": 3}, {"xPx": 0.5, "yPx": 0}):
            with self.subTest(sb=sb):
                doc = fresh()
                layer(doc, "deer")["safeBounds"] = sb
                self.assertNotEqual(schema_errors(doc), [])

    def test_esquema_safebounds_positivo_con_zona_aprobada_se_acepta(self):
        doc = fresh()
        self._aprobar_zona(doc)
        layer(doc, "deer")["safeBounds"] = {"xPx": 2, "yPx": 3}
        self.assertEqual(schema_errors(doc), [])

    def test_esquema_basta_una_zona_no_aprobada_entre_varias(self):
        doc = fresh()
        z1 = self._aprobar_zona(doc)
        z2 = copy.deepcopy(z1)
        z2.update(id="behind-deer-2", status="en_revision")
        z2.pop("approval")
        layer(doc, "deer")["reconstruction"]["zones"].append(z2)
        layer(doc, "deer")["safeBounds"] = {"xPx": 2, "yPx": 0}
        self.assertNotEqual(schema_errors(doc), [])
        z2.update(status="aprobado", approval=dict(FIXTURE_APPROVAL))
        self.assertEqual(schema_errors(doc), [])

    def test_esquema_zona_aprobada_exige_approval_tambien_aqui(self):
        doc = fresh()
        z = self._aprobar_zona(doc)
        z.pop("approval")
        layer(doc, "deer")["safeBounds"] = {"xPx": 2, "yPx": 0}
        self.assertNotEqual(schema_errors(doc), [])

    def test_esquema_safebounds_positivo_sin_reconstruccion_requerida_se_rechaza(self):
        doc = fresh()
        sky = layer(doc, "sky")
        sky["safeBounds"] = {"xPx": 1, "yPx": 0}
        self.assertNotEqual(schema_errors(doc), [])           # required=false

    def test_esquema_safebounds_positivo_con_required_true_pero_sin_zonas_se_rechaza(self):
        doc = fresh()
        sky = layer(doc, "sky")
        sky["safeBounds"] = {"xPx": 1, "yPx": 0}
        sky["reconstruction"] = {"required": True, "zones": []}
        self.assertNotEqual(schema_errors(doc), [])

    def test_esquema_safebounds_cero_con_zonas_sin_aprobar_es_valido(self):
        self.assertEqual(schema_errors(fresh()), [])  # ciervo: breathe declarado, zona en_revision, safeBounds 0

    def test_esquema_capa_movil_debe_declarar_reconstruccion_requerida(self):
        for canal in (
            {"channel": "translate", "type": "float", "amplitudePx": {"x": 1, "y": 1}, "speedHz": 0.05, "phaseRad": 0, "audio": QUIET},
            {"channel": "rotate", "type": "sway", "amplitudeDeg": 0.2, "speedHz": 0.05, "phaseRad": 0, "audio": QUIET},
            {"channel": "scale", "type": "breathe", "amplitude": 0.002, "speedHz": 0.05, "phaseRad": 0, "audio": QUIET},
        ):
            with self.subTest(canal=canal["channel"]):
                doc = fresh()
                layer(doc, "sky")["motion"] = {"channels": [canal]}
                self.assertNotEqual(schema_errors(doc), [])   # required=false
                layer(doc, "sky")["reconstruction"] = {"required": True, "zones": []}
                self.assertNotEqual(schema_errors(doc), [])   # required=true sin zonas
                layer(doc, "sky")["reconstruction"] = copy.deepcopy(layer(doc, "deer")["reconstruction"])
                layer(doc, "sky")["reconstruction"]["zones"][0]["id"] = "zona-cielo"
                self.assertEqual(schema_errors(doc), [])

    def test_esquema_canal_solo_de_opacidad_no_exige_reconstruccion(self):
        doc = fresh()
        layer(doc, "sky")["kind"] = "mist"
        layer(doc, "sky")["motion"] = {"channels": [
            {"channel": "opacity", "type": "pulse", "min": 0.8, "max": 1, "speedHz": 0.02, "phaseRad": 0, "audio": QUIET}]}
        self.assertEqual(schema_errors(doc), [])

    def test_esquema_marco_sigue_sin_poder_autorizar_movimiento(self):
        doc = fresh()
        layer(doc, "frame")["safeBounds"] = {"xPx": 1, "yPx": 0}
        self.assertNotEqual(schema_errors(doc), [])


# ---------------------------------------------------------------------------
# Regresión: casos de la primera entrega del esquema (siguen detectándose)
# ---------------------------------------------------------------------------
class RegresionEsquema(unittest.TestCase):
    NEGATIVOS = {
        "estado inválido": lambda d: layer(d, "sky").update(status="listo"),
        "aprobado sin approval": lambda d: layer(d, "sky").update(status="aprobado"),
        "approval en recurso no aprobado": lambda d: layer(d, "sky").update(approval=dict(FIXTURE_FILE_APPROVAL)),
        "approval por una IA": lambda d: layer(d, "sky").update(status="aprobado", approval=dict(FIXTURE_FILE_APPROVAL, by="claude")),
        "fullCanvas con placement recortado": lambda d: layer(d, "sky").update(placement={"x": 10, "y": 0, "width": 3830, "height": 2160}),
        "fullCanvas con scale 2": lambda d: layer(d, "sky").update(scale=2),
        "capa no pendiente sin archivo": lambda d: layer(d, "sky").update(file=None),
        "ruta con ..": lambda d: layer(d, "sky").update(file="layers/../x.png"),
        "ruta con mayúsculas": lambda d: layer(d, "sky").update(file="layers/Sky.png"),
        "reconstruction required con zonas vacías": lambda d: layer(d, "deer")["reconstruction"].update(zones=[]),
        "canal reservado flow": lambda d: layer(d, "deer")["motion"]["channels"].append({"channel": "flow", "type": "x"}),
        "amplitud sobre el límite duro": lambda d: layer(d, "deer")["motion"]["channels"].append(
            {"channel": "translate", "type": "float", "amplitudePx": {"x": 60, "y": 0}, "speedHz": 0.1, "phaseRad": 0, "audio": QUIET}),
        "audio.amount > 0.5": lambda d: layer(d, "deer")["motion"]["channels"][0]["audio"].update(band="bass", amount=0.9),
        "marco con movimiento": lambda d: layer(d, "frame")["motion"]["channels"].append(
            {"channel": "opacity", "type": "pulse", "min": 0.9, "max": 1, "speedHz": 0.1, "phaseRad": 0, "audio": QUIET}),
        "marco recortado": lambda d: layer(d, "frame").update(layout="cropped"),
        "render.fit cover": lambda d: d["render"].update(fit="cover"),
        "medición con base distinta de la maestra": lambda d: layer(d, "sky")["measurement"].update(basis="paquete-v0.1"),
        "zona no pendiente sin measurement": lambda d: layer(d, "deer")["reconstruction"]["zones"][0].update(measurement=None),
        "zona behind-element sin region": lambda d: layer(d, "deer")["reconstruction"]["zones"][0].update(region=None),
        "clave extra": lambda d: layer(d, "sky").update(extra=1),
        "audio no pendiente sin src": lambda d: d["audio"].update(status="en_revision"),
        "modo precomputed sin src": lambda d: d["audio"]["analysis"].update(precomputedSrc=None),
        "frame-bleed sin side": lambda d: layer(d, "deer")["reconstruction"]["zones"][0].update(type="frame-bleed"),
        "capa static con movimiento": lambda d: layer(d, "sky").update(kind="static", motion={"channels": [
            {"channel": "opacity", "type": "pulse", "min": 0.9, "max": 1, "speedHz": 0.1, "phaseRad": 0, "audio": QUIET}]}),
    }
    POSITIVOS = {
        "capa aprobada con approval": lambda d: layer(d, "sky").update(status="aprobado", approval=dict(FIXTURE_FILE_APPROVAL)),
        "zona frame-bleed completa": lambda d: layer(d, "deer")["reconstruction"]["zones"][0].update(
            type="frame-bleed", side="left", coveragePx=12, region=None),
        "obra con audio null": lambda d: d.update(audio=None),
        "ave con translate y rotate": lambda d: layer(d, "deer").update(kind="bird", motion={"channels": [
            {"channel": "translate", "type": "float", "amplitudePx": {"x": 10, "y": 5}, "speedHz": 0.05, "phaseRad": 1.0, "audio": QUIET},
            {"channel": "rotate", "type": "sway", "amplitudeDeg": 0.5, "speedHz": 0.05, "phaseRad": 2.0, "audio": QUIET}]}),
        "frame.visibleWindow medido": lambda d: d["frame"].update(
            visibleWindow={"x": 200, "y": 180, "width": 3400, "height": 1700}, measurement=layer(d, "sky")["measurement"]),
    }

    def test_esquema_negativos_se_rechazan(self):
        for name, mut in self.NEGATIVOS.items():
            with self.subTest(name):
                d = fresh()
                mut(d)
                self.assertNotEqual(schema_errors(d), [])

    def test_esquema_positivos_se_aceptan(self):
        for name, mut in self.POSITIVOS.items():
            with self.subTest(name):
                d = fresh()
                mut(d)
                self.assertEqual([e.message[:100] for e in schema_errors(d)], [])

    def test_esquema_es_un_esquema_valido_2020_12(self):
        Draft202012Validator.check_schema(SCHEMA)


# ---------------------------------------------------------------------------
# Archivos del repositorio
# ---------------------------------------------------------------------------
class ArchivosDelRepositorio(unittest.TestCase):
    def test_maestra_tiene_el_sha256_documentado(self):
        digest = hashlib.sha256((ROOT / "cuadro_vivo_mountains_that_breathe_master_4k.png").read_bytes()).hexdigest()
        self.assertEqual(digest, "d216046d9f78331c5372f867afc56a90a7b9f9659e27e026b28a89958cf2cfdc")
        self.assertIn(digest, (ROOT / "README.md").read_text(encoding="utf-8"))

    def test_json_sin_claves_duplicadas(self):
        def no_dup(pairs):
            keys = [k for k, _ in pairs]
            self.assertEqual(len(keys), len(set(keys)), f"claves duplicadas: {keys}")
            return dict(pairs)
        for rel in ("works/index.json", "works/work.schema.json"):
            json.loads((ROOT / rel).read_text(encoding="utf-8"), object_pairs_hook=no_dup)
        for block in re.findall(r"```json\n(.*?)\n```", CONTRATO, re.S):
            json.loads(block, object_pairs_hook=no_dup)

    def test_index_json_coherente(self):
        idx = json.loads((ROOT / "works/index.json").read_text(encoding="utf-8"))
        ids = [w["id"] for w in idx["works"]]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(len({w["order"] for w in idx["works"]}), len(ids))
        for w in idx["works"]:
            self.assertRegex(w["id"], r"^[a-z0-9]+(-[a-z0-9]+)*$")
            self.assertIn(w["status"], {"planificada", "en_preparacion", "en_revision", "aprobada"})
            if w["workFile"] is None:
                self.assertIn(w["status"], {"planificada", "en_preparacion"})
            else:
                self.assertTrue((ROOT / "works" / w["workFile"]).is_file())


# ---------------------------------------------------------------------------
# Reglas del plan SIN implementar: se listan como omitidas, no se ejecutan.
# ---------------------------------------------------------------------------
PENDIENTES = {
    "GEO-1 (validador real)": "el validador no existe; solo hay comprobación de referencia en estas pruebas",
    "MOV-10 (validador real)": "el validador no existe; solo hay comprobación de referencia en estas pruebas",
    "CAP-2 zIndex únicos": "requiere validador",
    "CAP-3 marco único y con zIndex más alto": "requiere validador",
    "CAP-1 ids únicos de capa y de zona": "requiere validador",
    "ARC-1 archivos citados existen (mayúsculas exactas)": "requiere validador; no hay capas ni audio en el repositorio",
    "ARC-2 / CAP-8 PNG reales: modo RGBA, dimensiones, alphaBounds": "requiere validador y capas reales",
    "MST-2 measurement.masterSha256 = master.sha256": "requiere validador",
    "EST-2 approval.fileSha256 = hash real del archivo": "requiere validador y capas reales",
    "EST-4 / EST-5 / EST-6 coherencia de estados entre campos": "requiere validador",
    "MOV-3 / MOV-4 presupuesto de desplazamiento y velocidad pico": "requiere validador",
    "MOV-2 límites por tipo de capa (kind)": "requiere validador; los valores son propuestos",
    "MOV-5/MOV-11 parte entre campos: coveragePx, visibleWindow, paintedIn vigentes": "requiere validador",
    "CAP-11 composición contra la maestra": "requiere validador y capas reales",
    "Pruebas visuales y de rendimiento (iPad Safari, TCL 55Q650G)": "requieren dispositivos reales; los límites de movimiento siguen siendo propuestos",
}


class ReglasPendientesDeImplementar(unittest.TestCase):
    pass


def _make_skip(motivo):
    @unittest.skip(f"PENDIENTE DE IMPLEMENTAR: {motivo}")
    def test(self):
        pass
    return test


for _i, (_regla, _motivo) in enumerate(PENDIENTES.items(), 1):
    setattr(ReglasPendientesDeImplementar, f"test_pendiente_{_i:02d}_{re.sub(r'[^a-z0-9]+', '_', _regla.lower()).strip('_')[:40]}",
            _make_skip(f"{_regla} — {_motivo}"))


if __name__ == "__main__":
    unittest.main()
