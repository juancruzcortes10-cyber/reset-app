import React, { useState, useEffect, useRef } from "react";
import {
  Home, CalendarDays, BookOpen, ShoppingCart, Activity, Clock, Users, Search,
  Check, ChevronLeft, ChevronRight, Leaf, Coffee, X, Sun, Moon, Apple, Droplet,
  Flame, Utensils, Smile, ArrowUp, ArrowDown, Minus, Plus, Sparkles, Heart,
  Repeat, ShieldCheck, Info, Zap, Settings, Bell, Download, Printer, RefreshCw, Pencil
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, YAxis } from "recharts";

const c = {
  bg: "#F4FAF6", card: "#FFFFFF", mint: "#EAF4EE", mintSoft: "#F0F7F2",
  ink: "#0F172B", inkSoft: "#64748B", line: "#E6EDE8",
  green: "#0C6B52", greenDeep: "#0A5240", accent: "#34D399",
  amber: "#C99A2E", rose: "#E11D48",
};
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
.ff-d{font-family:'Fraunces',Georgia,serif;} .ff-b{font-family:'Inter',system-ui,sans-serif;} .ff-m{font-family:'Space Mono',monospace;}
textarea,input{font-family:'Inter',system-ui,sans-serif;}
`;
const STORE_KEY = "reset_estado";
async function loadState() { try { if (typeof window !== "undefined" && window.storage) { const r = await window.storage.get(STORE_KEY); return r && r.value ? JSON.parse(r.value) : null; } } catch (e) {} return null; }
async function saveState(o) { try { if (typeof window !== "undefined" && window.storage) { await window.storage.set(STORE_KEY, JSON.stringify(o)); } } catch (e) {} }

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const hhmm = () => { const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };
const todayStr = () => new Date().toISOString().slice(0, 10);
const DAY_MS = 86400000;
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);
const addDaysISO = (iso, n) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const ddmm = (iso) => { const d = new Date(iso + "T00:00:00"); return `${d.getDate()}/${d.getMonth() + 1}`; };
const fmtLong = (iso) => cap(new Date(iso + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }));
const fmtShort = (iso) => cap(new Date(iso + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }));
const monthKey = (iso) => iso.slice(0, 7);
const monthLabel = (mk) => cap(new Date(mk + "-01T00:00:00").toLocaleDateString("es-AR", { month: "long", year: "numeric" }));
const hashId = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; };

const CATS = {
  desayuno: { label: "Desayuno", icon: Sun, g: ["#F3D58A", "#E2A93B"] },
  almuerzo: { label: "Almuerzo", icon: Utensils, g: ["#7FB58E", "#0C6B52"] },
  merienda: { label: "Merienda", icon: Apple, g: ["#BFE3C9", "#7C9A82"] },
  cena: { label: "Cena", icon: Moon, g: ["#1E7A5E", "#0A5240"] },
  bebida: { label: "Bebidas", icon: Coffee, g: ["#E7C26A", "#9A6A4A"] },
};
const visual = (r) => { const base = CATS[r.cat].g; const a = hashId(r.id); return `linear-gradient(${120 + (a % 90)}deg, ${base[0]}, ${base[1]})`; };

/* ---- ilustraciones de comida (SVG originales, sin dependencias) ---- */
const TINT = { desayuno: "#FBF3E2", almuerzo: "#E9F4EC", merienda: "#EAF4EE", cena: "#E5F0EA", bebida: "#FBF1DC" };
const colorOf = (r) => { const n = norm(r.name + " " + r.key.join(" ")); if (/verde|espinaca|brocoli|guisante|pak choi|albahaca|menta|apio/.test(n)) return "#7FB58E"; if (/frutos rojos|remolacha|hibisco/.test(n)) return "#C0506B"; if (/zanahoria|naranja|calabaza|curcuma|dorad|golden/.test(n)) return "#E08A3C"; if (/tomate/.test(n)) return "#D85A4A"; if (/cacao|chocolate|lenteja/.test(n)) return "#9B6A3F"; return "#8FBF9C"; };
const kindOf = (r) => { const n = norm(r.name); if (/batido|smoothie|licuado/.test(n)) return "smoothie"; if (/jugo/.test(n)) return "juice"; if (/pudding|yogur|parfait/.test(n)) return "pudding"; if (/porridge|avena/.test(n)) return "oatmeal"; if (/tostada/.test(n)) return "toast"; if (/huevo|revuelto|tortilla|poche/.test(n)) return "eggs"; if (/wrap/.test(n)) return "wrap"; if (/hummus/.test(n)) return "hummus"; if (/bolitas/.test(n)) return "balls"; if (/manzana asada/.test(n)) return "apple"; if (/rellen|zapallitos/.test(n)) return "stuffed"; if (/salteado|wok/.test(n)) return "stirfry"; if (/te |^te|infusion|leche dorada|golden|manzanilla|hinojo|hibisco/.test(n)) return "tea"; if (/crema|sopa|caldo|curry|miso/.test(n)) return "soup"; if (/salmon|merluza|atun|pescado/.test(n)) return "fish"; if (/ensalada/.test(n)) return "salad"; if (/buddha|bowl|quinoa/.test(n)) return "grainbowl"; if (/frutas/.test(n)) return "fruit"; return "plate"; };
const SW = 'stroke="#E4ECE6" stroke-width="2"';
const bowl = (food, extra = "") => `<ellipse cx="50" cy="47" rx="33" ry="10" fill="#fff" ${SW}/><path d="M17 47 a33 31 0 0 0 66 0 Z" fill="#fff" ${SW}/><ellipse cx="50" cy="47" rx="28" ry="7.5" fill="${food}"/>${extra}`;
const plate = (item) => `<ellipse cx="50" cy="58" rx="35" ry="11" fill="#fff" ${SW}/><ellipse cx="50" cy="55" rx="27" ry="8" fill="#F4F7F4"/>${item}`;
const steam = `<path d="M44 30 q-4 -6 0 -12" fill="none" stroke="#CBD5CF" stroke-width="2.5" stroke-linecap="round"/><path d="M52 30 q-4 -6 0 -12" fill="none" stroke="#CBD5CF" stroke-width="2.5" stroke-linecap="round"/>`;
const ART = {
  smoothie: (col) => `<rect x="35" y="22" width="30" height="56" rx="9" fill="#fff" ${SW}/><path d="M35 42 h30 v27 a9 9 0 0 1 -9 9 h-12 a9 9 0 0 1 -9 -9 Z" fill="${col}"/><rect x="56" y="12" width="4" height="26" rx="2" fill="#0C6B52" transform="rotate(14 58 25)"/><ellipse cx="49" cy="42" rx="13" ry="3" fill="#fff" opacity=".5"/>`,
  juice: (col) => `<rect x="37" y="34" width="26" height="44" rx="7" fill="#fff" ${SW}/><path d="M37 48 h26 v23 a7 7 0 0 1 -7 7 h-12 a7 7 0 0 1 -7 -7 Z" fill="${col}"/><circle cx="64" cy="32" r="9" fill="#F6D873" ${SW}/><path d="M64 23 v18 M55 32 h18" stroke="#E0A93B" stroke-width="1.5"/>`,
  pudding: () => `<rect x="33" y="26" width="34" height="52" rx="9" fill="#fff" ${SW}/><path d="M35 52 h30 v17 a7 7 0 0 1 -7 7 h-16 a7 7 0 0 1 -7 -7 Z" fill="#EFE2C4"/><rect x="35" y="42" width="30" height="11" fill="#CDEBD8"/><circle cx="44" cy="35" r="4" fill="#C0506B"/><circle cx="54" cy="33" r="4" fill="#C0506B"/><circle cx="50" cy="39" r="3.5" fill="#9B3F58"/>`,
  oatmeal: (col) => bowl("#EBDDBE", `<circle cx="42" cy="44" r="3.5" fill="#C0506B"/><circle cx="52" cy="43" r="3.5" fill="#C0506B"/><circle cx="58" cy="46" r="3" fill="${col}"/>`),
  toast: () => `<rect x="27" y="33" width="46" height="35" rx="11" fill="#E2C089"/><rect x="31" y="37" width="38" height="27" rx="8" fill="#ECD4A2"/><ellipse cx="50" cy="50" rx="16" ry="9" fill="#9CC4A2"/><circle cx="45" cy="49" r="2.2" fill="#3F7D52"/><circle cx="54" cy="51" r="2.2" fill="#3F7D52"/>`,
  eggs: () => plate(`<ellipse cx="47" cy="53" rx="15" ry="9.5" fill="#fff"/><circle cx="47" cy="53" r="5" fill="#F2B441"/><path d="M60 49 q5 -3 7 1" stroke="#6FB07F" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  wrap: () => plate(`<rect x="33" y="46" width="36" height="16" rx="8" fill="#E9D2A0"/><path d="M40 46 v16 M48 46 v16 M56 46 v16" stroke="#D9BE84" stroke-width="1.5"/><path d="M33 54 h36" stroke="#6FB07F" stroke-width="2"/>`),
  hummus: () => bowl("#E6C98C", `<rect x="44" y="20" width="4" height="22" rx="2" fill="#E08A3C" transform="rotate(-12 46 31)"/><rect x="52" y="20" width="4" height="22" rx="2" fill="#7FB58E" transform="rotate(10 54 31)"/>`),
  balls: () => plate(`<circle cx="42" cy="52" r="7" fill="#8A5A33"/><circle cx="56" cy="52" r="7" fill="#8A5A33"/><circle cx="49" cy="48" r="7" fill="#9B6A3F"/>`),
  apple: () => `<circle cx="50" cy="54" r="21" fill="#C94B3B"/><path d="M50 34 q3 -8 11 -8 q-3 8 -11 8" fill="#6FB07F"/><rect x="49" y="28" width="3" height="9" rx="1.5" fill="#7A4B2A"/><circle cx="44" cy="50" r="1.6" fill="#7A2A20"/><circle cx="56" cy="56" r="1.6" fill="#7A2A20"/>`,
  stuffed: () => `<path d="M24 44 q26 30 52 0 Z" fill="#3E8A5C"/><path d="M30 46 q20 18 40 0 Z" fill="#EBDDBE"/><circle cx="44" cy="48" r="2.5" fill="#D85A4A"/><circle cx="54" cy="49" r="2.5" fill="#E08A3C"/><circle cx="49" cy="51" r="2.5" fill="#7FB58E"/>`,
  stirfry: () => `<circle cx="45" cy="52" r="23" fill="#fff" ${SW}/><circle cx="45" cy="52" r="17" fill="#EAF1EA"/><rect x="64" y="49" width="24" height="5" rx="2.5" fill="#9AA6A0"/><circle cx="40" cy="50" r="3" fill="#7FB58E"/><circle cx="50" cy="48" r="3" fill="#E08A3C"/><circle cx="46" cy="56" r="3" fill="#D85A4A"/><circle cx="40" cy="58" r="2.5" fill="#3E8A5C"/>`,
  tea: (col) => `<path d="M31 36 h33 v20 a13 13 0 0 1 -13 13 h-7 a13 13 0 0 1 -13 -13 Z" fill="#fff" ${SW}/><path d="M64 40 h5 a8 8 0 0 1 0 16 h-5" fill="none" ${SW.replace('width="2"','width="3"')}/><ellipse cx="47" cy="40" rx="15" ry="3.5" fill="${col}"/>${steam}`,
  soup: (col) => bowl(col, steam),
  fish: () => plate(`<path d="M34 53 q12 -12 26 0 q-12 12 -26 0 Z" fill="#E79B7A"/><path d="M60 53 l9 -6 v12 Z" fill="#E79B7A"/><path d="M40 53 h14" stroke="#C9764F" stroke-width="1.5"/><circle cx="66" cy="46" r="5" fill="#F6D873"/>`),
  salad: () => bowl("#EAF3EC", `<path d="M38 45 q6 -10 12 0 q6 -10 12 0 Z" fill="#5FA873"/><path d="M42 47 q5 -7 10 0 Z" fill="#7FB58E"/><circle cx="56" cy="44" r="3" fill="#D85A4A"/>`),
  grainbowl: () => bowl("#F1E7CB", `<ellipse cx="42" cy="45" rx="8" ry="4" fill="#6FB07F"/><ellipse cx="56" cy="45" rx="7" ry="3.5" fill="#E08A3C"/><ellipse cx="50" cy="49" rx="7" ry="3.5" fill="#C9A24B"/>`),
  fruit: () => bowl("#fff", `<circle cx="42" cy="44" r="4" fill="#C0506B"/><circle cx="51" cy="43" r="4" fill="#E2A93B"/><circle cx="59" cy="45" r="4" fill="#E08A3C"/><circle cx="47" cy="48" r="3.5" fill="#7FB58E"/>`),
  plate: (col) => bowl(col),
};
const foodSVG = (r) => { const k = kindOf(r); const fn = ART[k] || ART.plate; return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${fn(colorOf(r))}</svg>`; };


const PHASES = [
  { n: 1, label: "Preparación y Alcalinización", range: "Días 1–10" },
  { n: 2, label: "Descanso Digestivo Celular", range: "Días 11–20" },
  { n: 3, label: "Consolidación y Hábitos de Oro", range: "Días 21–30" },
];
const PANTRY = ["Espinaca","Kale","Brócoli","Calabaza","Calabacín","Zanahoria","Coliflor","Tomate","Apio","Puerro","Champiñones","Pak choi","Berenjena","Aguacate","Frutos rojos","Naranja","Banana","Manzana","Limón","Jengibre","Cúrcuma","Ajo","Albahaca","Menta","Quinoa","Avena","Arroz integral","Fideos de arroz","Salmón","Merluza","Atún","Pollo","Huevo","Tofu","Garbanzos","Lentejas","Guisantes","Leche de coco","Yogur de coco","Miso","Nueces","Semillas","Aceite de oliva","Miel"];

/* img: pegá una URL de tu foto para reemplazar el visual generado */
const R = (id, cat, name, min, serv, tags, key, ing, steps, img = "") => ({ id, cat, name, min, serv, tags, key, ing, steps, img });
const RECIPES = [
  R("d1","desayuno","Batido verde de espinaca y banana",5,1,["Antiinflamatorio","Sin azúcar"],["espinaca","banana","leche de coco","semillas"],["1 puñado de espinaca","1 banana","1 taza de leche de coco","1 cda de chía","Hielo"],["Coloca todo en la licuadora.","Licúa 1 minuto.","Sirve frío."]),
  R("d2","desayuno","Pudding de chía y coco",5,1,["Antiinflamatorio","Sin azúcar"],["semillas","leche de coco","frutos rojos"],["3 cdas de chía","1 taza de leche de coco","1 cdta de miel","Frutos rojos"],["Mezcla chía, leche de coco y miel.","Refrigera toda la noche.","Sirve con frutos rojos."]),
  R("d3","desayuno","Bowl de yogur de coco y cúrcuma dorada",5,1,["Antioxidante","Vegano"],["yogur de coco","nueces","cúrcuma","miel"],["1 taza de yogur de coco","1 pizca de cúrcuma","Nueces","1 cdta de miel"],["Mezcla el yogur con la cúrcuma.","Sirve en un bowl.","Decora con nueces y miel."]),
  R("d4","desayuno","Tostada de aguacate y huevo poché",10,1,["Proteico"],["aguacate","huevo","limon","pan integral"],["1 pan integral","1/2 aguacate","1 huevo","Limón","Sal y pimienta"],["Pisa el aguacate con limón y sal.","Escalfa el huevo 3 minutos.","Unta y corona con el huevo."]),
  R("d5","desayuno","Porridge de quinoa, manzana y canela",15,2,["Vegano","Sin gluten"],["quinoa","manzana","leche de coco","canela"],["1/2 taza de quinoa","1 taza de leche de coco","1 manzana","Canela"],["Cocina la quinoa en leche de coco 12 minutos.","Agrega manzana y canela.","Sirve tibio."]),
  R("d6","desayuno","Smoothie de frutos rojos y jengibre",5,1,["Antiinflamatorio","Vegano"],["frutos rojos","jengibre","banana"],["1 taza de frutos rojos","1/2 banana","Jengibre","1 taza de agua"],["Licúa todo.","Ajusta con agua.","Sirve frío."]),
  R("d7","desayuno","Revuelto de huevo, espinaca y champiñones",10,1,["Proteico"],["huevo","espinaca","champiñones","aceite de oliva"],["2 huevos","Espinaca","Champiñones","Aceite de oliva"],["Saltea champiñones 3 minutos.","Agrega espinaca.","Vierte el huevo y revuelve."]),
  R("d8","desayuno","Avena nocturna con frutos rojos",5,1,["Vegano","Sin azúcar"],["avena","frutos rojos","leche de coco","semillas"],["1/2 taza de avena","3/4 taza de leche de coco","Frutos rojos","Chía"],["Mezcla avena, leche de coco y chía.","Refrigera toda la noche.","Agrega frutos rojos."]),
  R("d9","desayuno","Bowl de avena, banana y nueces",8,1,["Vegano"],["avena","banana","nueces","leche de coco"],["1/2 taza de avena","1 taza de leche de coco","1 banana","Nueces"],["Cocina la avena 5 minutos.","Sirve con banana.","Termina con nueces."]),
  R("d10","desayuno","Tostada integral con tomate y aceite de oliva",6,1,["Vegano"],["pan integral","tomate","aceite de oliva","ajo"],["1 pan integral","1 tomate","Aceite de oliva","Ajo"],["Tuesta el pan y frota con ajo.","Cubre con tomate rallado.","Rocía con aceite y sal."]),
  R("d11","desayuno","Pudding de chía y cacao",5,1,["Vegano","Antioxidante"],["semillas","leche de coco","cacao"],["3 cdas de chía","1 taza de leche de coco","1 cdta de cacao","1 cdta de miel"],["Mezcla todo.","Refrigera 4 horas.","Sirve frío."]),
  R("d12","desayuno","Bowl de frutas con semillas y coco",6,1,["Vegano","Sin azúcar"],["manzana","banana","semillas","yogur de coco"],["1 manzana","1 banana","Semillas","Yogur de coco"],["Corta la fruta.","Coloca sobre el yogur.","Termina con semillas."]),

  R("a1","almuerzo","Bowl de quinoa, garbanzos y vegetales asados",25,2,["Vegano","Sin gluten"],["quinoa","garbanzos","calabacín","tomate","aceite de oliva"],["1 taza de quinoa","1 taza de garbanzos","1 calabacín","Tomates cherry","Aceite de oliva"],["Asa calabacín y tomates 18 minutos.","Mezcla con quinoa y garbanzos.","Termina con aceite."]),
  R("a2","almuerzo","Ensalada de salmón, aguacate y rúcula",15,1,["Omega-3"],["salmón","aguacate","limon","rúcula","aceite de oliva"],["1 lomo de salmón","1/2 aguacate","Rúcula","Aceite de oliva","Limón"],["Sella el salmón 4 minutos por lado.","Arma rúcula y aguacate.","Desmenuza y aliña."]),
  R("a3","almuerzo","Sopa de lentejas con cúrcuma y zanahoria",30,3,["Vegano","Reconfortante"],["lentejas","zanahoria","cúrcuma","ajo"],["1 taza de lentejas","2 zanahorias","Cúrcuma","Ajo","Caldo de verduras"],["Sofríe ajo y zanahoria con cúrcuma.","Agrega lentejas y caldo.","Cocina 25 minutos."]),
  R("a4","almuerzo","Wrap de pollo al limón con vegetales",20,1,["Proteico"],["pollo","limon","espinaca","aguacate","tortilla"],["1 filete de pollo","Limón","1 tortilla integral","Espinaca","Aguacate"],["Cocina el pollo 5 minutos por lado.","Corta en tiras.","Arma el wrap."]),
  R("a5","almuerzo","Buddha bowl de arroz integral y tofu",25,2,["Vegano"],["arroz integral","tofu","brócoli","semillas","salsa de soja"],["1 taza de arroz integral","Tofu firme","Brócoli","Salsa de soja","Sésamo"],["Dora el tofu.","Cocina el brócoli al vapor.","Sirve con soja y sésamo."]),
  R("a6","almuerzo","Ensalada tibia de garbanzos y espinaca",15,2,["Vegano","Sin gluten"],["garbanzos","espinaca","limon","aceite de oliva","comino"],["1 taza de garbanzos","Espinaca","Aceite de oliva","Limón","Comino"],["Saltea garbanzos con comino.","Agrega espinaca.","Aliña con aceite y limón."]),
  R("a7","almuerzo","Merluza al horno con puré de coliflor",30,2,["Sin gluten"],["merluza","coliflor","leche de coco","ajo"],["2 filetes de merluza","2 tazas de coliflor","Leche de coco","Ajo"],["Tritura la coliflor con leche de coco.","Hornea la merluza 12 minutos.","Sirve sobre el puré."]),
  R("a8","almuerzo","Salteado de pollo, brócoli y jengibre",20,2,["Proteico"],["pollo","brócoli","jengibre","ajo","salsa de soja"],["2 filetes de pollo","Brócoli","Jengibre","Ajo","Salsa de soja"],["Saltea el pollo.","Agrega brócoli, ajo y jengibre.","Termina con soja."]),
  R("a9","almuerzo","Ensalada de lentejas, tomate y rúcula",15,2,["Vegano","Sin gluten"],["lentejas","tomate","rúcula","aceite de oliva","limon"],["1 taza de lentejas","Tomate","Rúcula","Aceite de oliva","Limón"],["Mezcla lentejas con tomate y rúcula.","Aliña.","Sirve fresca."]),
  R("a10","almuerzo","Calabaza rellena de quinoa y vegetales",35,2,["Vegano"],["calabaza","quinoa","pimiento","aceite de oliva"],["1 calabaza","1 taza de quinoa","Pimiento","Aceite de oliva"],["Hornea la calabaza 25 minutos.","Rellena con quinoa.","Hornea 8 minutos más."]),
  R("a11","almuerzo","Curry de garbanzos y espinaca",20,2,["Vegano","Antiinflamatorio"],["garbanzos","espinaca","leche de coco","cúrcuma"],["1 taza de garbanzos","Espinaca","Leche de coco","Cúrcuma","Curry"],["Tuesta las especias.","Suma leche de coco y garbanzos.","Agrega espinaca y cocina 5 minutos."]),
  R("a12","almuerzo","Ensalada de atún, huevo y verdes",12,1,["Omega-3","Proteico"],["atún","huevo","tomate","aceite de oliva"],["1 lata de atún","1 huevo duro","Hojas verdes","Tomate","Aceite de oliva"],["Arma la base de verdes.","Suma atún, huevo y tomate.","Aliña con aceite y limón."]),

  R("m1","merienda","Manzana asada con canela y nueces",20,2,["Vegano","Sin gluten"],["manzana","nueces","miel","canela"],["2 manzanas","Nueces","Canela","Miel"],["Retira el centro.","Rellena con nueces y miel.","Hornea 18 minutos."]),
  R("m2","merienda","Hummus con bastones de apio y zanahoria",10,4,["Vegano","Sin gluten"],["garbanzos","apio","zanahoria","limon","tahini"],["1 taza de garbanzos","Tahini","Limón","Ajo","Apio y zanahoria"],["Procesa garbanzos con tahini y limón.","Ajusta con agua.","Sirve con bastones."]),
  R("m3","merienda","Yogur de coco con frutos rojos y semillas",5,1,["Vegano"],["yogur de coco","frutos rojos","semillas"],["1 taza de yogur de coco","Frutos rojos","Semillas"],["Coloca el yogur.","Agrega frutos rojos.","Espolvorea semillas."]),
  R("m4","merienda","Tostada de aguacate y tomate cherry",8,1,["Vegano"],["aguacate","tomate","limon","pan integral"],["1 pan integral","1/2 aguacate","Tomates cherry","Limón"],["Pisa el aguacate.","Unta sobre la tostada.","Corona con tomates."]),
  R("m5","merienda","Bolitas energéticas de avena y cacao",15,6,["Vegano"],["avena","nueces","miel","cacao"],["1 taza de avena","Nueces","Cacao","Miel"],["Procesa avena con nueces.","Agrega cacao y miel.","Forma bolitas y refrigera."]),
  R("m6","merienda","Naranja, nueces y cacao amargo",3,1,["Antioxidante"],["naranja","nueces","cacao"],["1 naranja","Nueces","Cacao amargo"],["Separa la naranja.","Acompaña con nueces.","Cierra con cacao."]),
  R("m7","merienda","Bastones de zanahoria con guacamole",8,2,["Vegano"],["zanahoria","aguacate","limon"],["Zanahorias","1 aguacate","Limón","Sal"],["Pisa el aguacate con limón.","Corta zanahoria.","Sirve para dipear."]),
  R("m8","merienda","Tostada de yogur de coco y frutos rojos",6,1,["Vegano"],["pan integral","yogur de coco","frutos rojos"],["1 pan integral","Yogur de coco","Frutos rojos"],["Tuesta el pan.","Unta yogur.","Corona con frutos rojos."]),
  R("m9","merienda","Tostada de banana y semillas",5,1,["Vegano"],["pan integral","banana","semillas","miel"],["1 pan integral","1 banana","Semillas","Miel"],["Tuesta el pan.","Coloca banana en rodajas.","Termina con semillas y miel."]),

  R("c1","cena","Crema de calabaza y cúrcuma",20,2,["Antiinflamatorio","Vegano"],["calabaza","cúrcuma","aceite de oliva","semillas"],["3 tazas de calabaza","Aceite de oliva","Cúrcuma","Pimienta","2 tazas de caldo","Semillas"],["Saltea la calabaza 5 minutos.","Suma cúrcuma y pimienta.","Agrega caldo, 12 minutos.","Tritura y sirve con semillas."]),
  R("c2","cena","Sopa miso con espinacas y tofu",15,2,["Vegano"],["miso","tofu","espinaca","semillas"],["3 tazas de agua","2 cdas de miso","Tofu","Espinaca","Sésamo"],["Calienta el agua.","Disuelve el miso aparte.","Agrega tofu y espinaca.","Suma el miso y sirve."]),
  R("c3","cena","Salmón al horno con espárragos",20,2,["Omega-3","Sin gluten"],["salmón","espárragos","aceite de oliva","limon"],["2 lomos de salmón","Espárragos","Aceite de oliva","Limón"],["Precalienta a 200°C.","Acomoda salmón y espárragos.","Pon limón.","Hornea 12-15 minutos."]),
  R("c4","cena","Crema de calabacín y albahaca",15,2,["Vegano"],["calabacín","albahaca","aceite de oliva","cebolla"],["2 calabacines","1 cebolla","Aceite de oliva","Albahaca","Caldo"],["Sofríe la cebolla.","Agrega calabacín.","Vierte caldo, 8 minutos.","Suma albahaca y procesa."]),
  R("c5","cena","Ensalada tibia de quinoa y vegetales asados",15,2,["Vegano","Sin gluten"],["quinoa","calabacín","pimiento","aceite de oliva","limon"],["1 taza de quinoa","Pimiento","Calabacín","Aceite de oliva","Limón"],["Saltea pimiento y calabacín.","Suma quinoa.","Vierte limón.","Sirve tibio."]),
  R("c6","cena","Pechuga de pollo al limón con brócoli al vapor",20,2,["Proteico"],["pollo","brócoli","limon","ajo"],["2 filetes de pollo","Brócoli","Limón","Ajo","Aceite de oliva"],["Marina el pollo.","Cocina el brócoli al vapor.","Cocina el pollo.","Sirve junto."]),
  R("c7","cena","Caldo de huesos con fideos de calabacín",15,2,["Reconfortante"],["calabacín","jengibre"],["3 tazas de caldo","2 calabacines","Jengibre","Cebollino"],["Espiraliza los calabacines.","Calienta el caldo con jengibre.","Vierte sobre los fideos.","Suma cebollino."]),
  R("c8","cena","Crema de zanahoria y jengibre",20,2,["Antiinflamatorio","Vegano"],["zanahoria","jengibre","aceite de coco","semillas"],["4 zanahorias","Jengibre","Aceite de coco","2 tazas de caldo","Sésamo"],["Saltea zanahoria y jengibre.","Agrega caldo, 12 minutos.","Tritura.","Sirve con sésamo."]),
  R("c9","cena","Salteado de tofu con pak choi y sésamo",15,2,["Vegano"],["tofu","pak choi","semillas","salsa de soja"],["Tofu firme","Pak choi","Aceite de sésamo","Salsa de soja","Sésamo"],["Dora el tofu.","Suma pak choi y soja.","Saltea 3 minutos.","Termina con sésamo."]),
  R("c10","cena","Merluza en papillote con tomates cherry",20,2,["Sin gluten"],["merluza","tomate","aceite de oliva","orégano"],["2 filetes de merluza","Tomates cherry","Aceite de oliva","Orégano"],["Precalienta a 200°C.","Arma paquetes con tomate.","Rocía y cierra.","Hornea 15 minutos."]),
  R("c11","cena","Sopa de tomate y albahaca fresca",15,2,["Antioxidante","Vegano"],["tomate","albahaca","ajo","aceite de oliva"],["2 tazas de tomate","Caldo","Albahaca","Aceite de oliva","Ajo"],["Sofríe el ajo.","Agrega tomate y caldo.","Cocina 10 minutos.","Suma albahaca."]),
  R("c12","cena","Wok de fideos de arroz con shiitake",15,2,["Vegano"],["fideos de arroz","champiñones","espinaca","salsa de soja"],["Fideos de arroz","Shiitake","Salsa de soja","Sésamo","Espinaca"],["Hidrata los fideos.","Saltea setas y espinaca.","Suma fideos y soja.","Mezcla y sirve."]),
  R("c13","cena","Crema de coliflor y leche de coco",20,2,["Antiinflamatorio","Vegano"],["coliflor","leche de coco","aceite de oliva","nuez moscada"],["2 tazas de coliflor","Leche de coco","Aceite de oliva","Nuez moscada"],["Hierve la coliflor.","Suma leche de coco y especias.","Tritura.","Sirve caliente."]),
  R("c14","cena","Aguacate relleno de atún y apio",10,1,["Omega-3","Sin cocción"],["aguacate","atún","apio","limon"],["1 aguacate","Atún","Apio","Limón","Aceite de oliva"],["Corta el aguacate.","Mezcla atún con apio y limón.","Rellena.","Termina con pimienta."]),
  R("c15","cena","Tortilla de claras con champiñones y espinacas",10,1,["Proteico"],["huevo","champiñones","espinaca","aceite de oliva"],["4 claras","Champiñones","Espinaca","Aceite de oliva"],["Saltea champiñones y espinaca.","Bate las claras.","Vierte y dobla."]),
  R("c16","cena","Sopa verde de apio, calabacín y espinacas",20,2,["Depurativo","Vegano"],["apio","calabacín","espinaca","aceite de oliva"],["1 calabacín","Apio","Espinaca","Caldo","Aceite de oliva"],["Cocina calabacín y apio.","Suma espinaca.","Procesa con aceite."]),
  R("c17","cena","Berenjenas a la plancha con yogur de coco y menta",15,2,["Vegano"],["berenjena","yogur de coco","menta","aceite de oliva"],["1 berenjena","Yogur de coco","Menta","Aceite de oliva"],["Corta la berenjena.","Cocina a la plancha.","Mezcla yogur con menta.","Sirve."]),
  R("c18","cena","Crema de guisantes y menta fresca",15,2,["Antioxidante","Vegano"],["guisantes","menta","aceite de oliva"],["2 tazas de guisantes","Caldo","Menta","Aceite de oliva"],["Calienta el caldo.","Suma guisantes 5 minutos.","Agrega menta.","Tritura fino."]),
  R("c19","cena","Curry rápido de espinacas y leche de coco",15,2,["Antiinflamatorio","Vegano"],["espinaca","leche de coco","jengibre","curry"],["Espinaca","Leche de coco","Curry","Aceite de coco"],["Tuesta el curry.","Vierte leche de coco.","Suma espinaca.","Cocina 2 minutos."]),
  R("c20","cena","Caldo depurativo de puerro y apio",20,2,["Depurativo","Vegano"],["puerro","apio","aceite de oliva"],["2 puerros","Apio","4 tazas de agua","Aceite de oliva"],["Rehoga puerro y apio.","Suma agua.","Cocina 15 minutos.","Cuela y sirve."]),
  R("c21","cena","Zapallitos rellenos de quinoa",30,2,["Vegano","Sin gluten"],["calabacín","quinoa","tomate","aceite de oliva"],["3 calabacines","1 taza de quinoa","Tomate","Aceite de oliva"],["Ahueca los calabacines.","Rellena con quinoa y tomate.","Hornea 20 minutos."]),
  R("c22","cena","Sopa crema de brócoli",18,2,["Antioxidante","Vegano"],["brócoli","aceite de oliva","ajo"],["2 tazas de brócoli","Caldo","Ajo","Aceite de oliva"],["Cocina el brócoli con ajo.","Suma caldo.","Tritura.","Sirve caliente."]),

  R("b1","bebida","Té dorado de jengibre y cúrcuma",10,2,["Antiinflamatorio","Caliente"],["jengibre","cúrcuma","limon","miel"],["Agua","Jengibre","Cúrcuma","Limón","Miel"],["Hierve con jengibre 5 minutos.","Suma cúrcuma.","Cuela, agrega limón y miel."]),
  R("b2","bebida","Té verde con menta",5,2,["Antioxidante"],["menta","té verde"],["Agua","Té verde","Menta"],["Calienta sin hervir.","Agrega té y menta.","Reposa 3 minutos."]),
  R("b3","bebida","Agua de pepino, limón y menta",5,4,["Hidratante","Frío"],["pepino","limon","menta"],["1 litro de agua","Pepino","Limón","Menta"],["Coloca todo en una jarra.","Refrigera 1 hora.","Sirve frío."]),
  R("b4","bebida","Infusión de hibisco frío",10,4,["Antioxidante","Frío"],["hibisco","limon"],["1 litro de agua","Hibisco","Limón","Hielo"],["Hierve con hibisco.","Cuela y enfría.","Sirve con hielo."]),
  R("b5","bebida","Leche dorada (golden milk)",10,2,["Antiinflamatorio","Caliente"],["leche de coco","cúrcuma","jengibre","miel"],["Leche de coco","Cúrcuma","Jengibre","Miel"],["Calienta la leche.","Suma especias.","Mezcla y endulza."]),
  R("b6","bebida","Infusión de manzanilla y jengibre",8,2,["Relajante","Caliente"],["manzanilla","jengibre","miel"],["Agua","Manzanilla","Jengibre","Miel"],["Hierve con jengibre.","Suma manzanilla.","Reposa 5 minutos."]),
  R("b7","bebida","Infusión de hinojo y menta",8,2,["Digestiva","Caliente"],["hinojo","menta"],["Agua","Hinojo","Menta"],["Hierve con hinojo.","Suma menta.","Reposa 3 minutos."]),
  R("b8","bebida","Té de jengibre, limón y miel",12,1,["Reconfortante","Caliente"],["jengibre","limon","miel","canela"],["Agua","Jengibre","Limón","Miel","Canela"],["Hierve con jengibre.","Suma limón y miel.","Reposa 5 minutos."]),
  R("b9","bebida","Jugo verde detox",6,1,["Detox","Frío"],["apio","pepino","manzana","limon","jengibre"],["Apio","1/2 pepino","1 manzana","Limón","Jengibre"],["Licúa con agua.","Cuela si preferís.","Sirve al momento."]),
  R("b10","bebida","Jugo de zanahoria, naranja y jengibre",6,1,["Detox","Frío"],["zanahoria","naranja","jengibre"],["2 zanahorias","2 naranjas","Jengibre"],["Licúa o exprime.","Mezcla.","Sirve frío."]),
  R("b11","bebida","Licuado de remolacha y naranja",6,1,["Detox","Frío"],["remolacha","naranja","limon"],["1 remolacha","2 naranjas","Limón","Agua"],["Licúa la remolacha con naranja.","Suma limón y agua.","Cuela y sirve."]),
];
const byId = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
const SNACKS = ["Un puñado de nueces (10 u.)","1 manzana","1 naranja","Bastones de apio y zanahoria","Yogur de coco con semillas","2 cuadraditos de cacao amargo","Puñado de frutos rojos","Infusión + 5 almendras"];

const RAWCAT = {
  verduras: ["espinaca","kale","brócoli","calabaza","calabacín","zanahoria","coliflor","tomate","apio","puerro","champiñones","pak choi","berenjena","pepino","espárragos","pimiento","cebolla","rúcula","guisantes","remolacha"],
  proteinas: ["salmón","merluza","atún","pollo","huevo","tofu","garbanzos","lentejas","miso"],
  frutas: ["frutos rojos","banana","manzana","limon","naranja","aguacate"],
  secos: ["quinoa","avena","arroz integral","fideos de arroz","nueces","semillas","leche de coco","yogur de coco","aceite de oliva","aceite de coco","aceite de sésamo","salsa de soja","tahini","cacao","pan integral","tortilla","miel"],
  infusiones: ["té verde","hibisco","manzanilla","hinojo"],
  condimentos: ["cúrcuma","jengibre","ajo","albahaca","menta","orégano","comino","nuez moscada","curry","cebollino","canela"],
};
const CATMAP = {}; Object.entries(RAWCAT).forEach(([k, arr]) => arr.forEach((t) => { CATMAP[norm(t)] = k; }));
const SHOPGROUPS = [{ k: "verduras", label: "Verduras" },{ k: "proteinas", label: "Proteínas" },{ k: "frutas", label: "Frutas" },{ k: "secos", label: "Secos y despensa" },{ k: "infusiones", label: "Infusiones" },{ k: "condimentos", label: "Condimentos" }];
const WEEKS = [{ n: 1, label: "Semana 1", days: [1,2,3,4,5,6,7] },{ n: 2, label: "Semana 2", days: [8,9,10,11,12,13,14] },{ n: 3, label: "Semana 3", days: [15,16,17,18,19,20,21] },{ n: 4, label: "Semana 4", days: [22,23,24,25,26,27,28,29,30] }];
const SUBS = [["Pollo","pavo, tofu firme o garbanzos"],["Salmón / merluza","atún, caballa o lentejas"],["Leche vegetal","leche de coco, de almendras o agua"],["Quinoa","arroz integral o mijo"],["Yogur de coco","yogur natural sin azúcar"],["Aguacate","hummus o un hilo de aceite de oliva"],["Frutos rojos","manzana, pera o naranja"],["Espinaca","kale, acelga o rúcula"],["Calabacín","calabaza o berenjena"],["Garbanzos","lentejas o porotos"],["Nueces","almendras o semillas de zapallo"],["Miel","un dátil o dejar sin endulzar"],["Salsa de soja","tamari o sal marina"],["Tahini","manteca de maní sin azúcar"],["Fideos de arroz","fideos integrales o de calabacín"]];
const GUIDE = { permitidos: ["Vegetales de hoja verde y crucíferas","Frutos rojos, naranja, manzana","Quinoa, avena, arroz integral","Aceite de oliva, aguacate, nueces","Pescado, pollo, huevo, tofu","Legumbres","Cúrcuma, jengibre, ajo, hierbas","Infusiones sin azúcar"], moderar: ["Lácteos","Café (1 al día)","Frutas muy dulces","Miel y endulzantes naturales","Cereales con gluten integral","Sal"], evitar: ["Snacks y comida rápida","Azúcares refinados y gaseosas","Pan blanco, galletas, pasteles","Margarina y frituras","Embutidos y carnes procesadas","Alcohol"] };
const BONOS = [{ t: "7 desayunos antiinflamatorios", ids: ["d1","d2","d3","d6","d8","d5","d9"], icon: Sun },{ t: "10 cenas livianas", ids: ["c1","c2","c4","c7","c8","c13","c16","c18","c19","c11"], icon: Moon },{ t: "Jugos y licuados detox", ids: ["b9","b10","b11","d1","d6"], icon: Droplet },{ t: "Infusiones para deshinchar", ids: ["b1","b5","b6","b7","b8","b2"], icon: Coffee },{ t: "Menú express (≤10 min)", ids: RECIPES.filter((r) => r.min <= 10).map((r) => r.id), icon: Zap }];
const CHECK = [{ id: "agua", label: "Tomé mis 2.5 L de agua", icon: Droplet },{ id: "mov", label: "Me moví hoy", icon: Flame },{ id: "infusion", label: "Tomé mi infusión", icon: Coffee },{ id: "sueno", label: "Dormí bien", icon: Moon },{ id: "animo", label: "Buen estado de ánimo", icon: Smile }];
const METRICS = [{ k: "energia", label: "Energía", goodDir: "up" },{ k: "humor", label: "Humor", goodDir: "up" },{ k: "hinchazon", label: "Hinchazón", goodDir: "down" }];
const SLOTS = [{ k: "desayuno", label: "Desayuno" },{ k: "almuerzo", label: "Almuerzo" },{ k: "merienda", label: "Merienda" },{ k: "cena", label: "Cena" }];
const DIETAS = [["omnivora","Como de todo"],["sinpescado","Sin pescado"],["vegetariana","Vegetariana"],["vegana","Vegana"]];
const OBJETIVOS = [["desinflamar","Desinflamar"],["energia","Más energía"],["habitos","Crear hábitos"]];

const allowRecipe = (r, p) => {
  const k = r.key.map(norm); const has = (x) => k.some((t) => t.includes(x));
  if (p.dieta === "vegana" && (has("pollo") || has("salmon") || has("merluza") || has("atun") || has("huevo"))) return false;
  if (p.dieta === "vegetariana" && (has("pollo") || has("salmon") || has("merluza") || has("atun"))) return false;
  if (p.dieta === "sinpescado" && (has("salmon") || has("merluza") || has("atun"))) return false;
  if (p.alergias.nueces && has("nueces")) return false;
  if (p.alergias.gluten && (has("pan integral") || has("tortilla"))) return false;
  return true;
};

/* =============================== App =============================== */
export default function App() {
  const [entered, setEntered] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [obStep, setObStep] = useState(0);
  const [tab, setTab] = useState("hoy");
  const [openRecipe, setOpenRecipe] = useState(null);
  const [recipeCat, setRecipeCat] = useState("todas");
  const [query, setQuery] = useState("");
  const [pantry, setPantry] = useState([]);
  const [planDay, setPlanDay] = useState(1);
  const [shopTab, setShopTab] = useState("lista");
  const [shopWeek, setShopWeek] = useState(1);
  const [settings, setSettings] = useState(false);
  const [swapPick, setSwapPick] = useState(null);

  const [prefs, setPrefs] = useState({ dieta: "omnivora", alergias: { nueces: false, gluten: false }, porciones: 2, objetivo: "desinflamar" });
  const [feel, setFeel] = useState({ energia: "up", humor: "up", hinchazon: "down" });
  const [digestion, setDigestion] = useState("up");
  const [hydByDate, setHydByDate] = useState({});
  const [history, setHistory] = useState({});
  const [startDate, setStartDate] = useState(todayStr());
  const [checklistByDate, setChecklistByDate] = useState({});
  const [mealsByDate, setMealsByDate] = useState({});
  const [swaps, setSwaps] = useState({});
  const [favs, setFavs] = useState({});
  const [notes, setNotes] = useState({});
  const [shopCheck, setShopCheck] = useState({});
  const [pesoInicial, setPesoInicial] = useState("");
  const [pesoLog, setPesoLog] = useState([]);
  const [cintura, setCintura] = useState("");
  const [pesoInput, setPesoInput] = useState("");
  const [selMonth, setSelMonth] = useState(monthKey(todayStr()));
  const [reminders, setReminders] = useState({ agua: { on: false, hora: "10:00" }, infusion: { on: false, hora: "16:00" }, compras: { on: false, hora: "10:00" } });
  const [notif, setNotif] = useState(typeof Notification !== "undefined" ? Notification.permission : "default");
  const [lastSaved, setLastSaved] = useState(null);
  const firedRef = useRef(new Set());

  const today = todayStr();
  const checklist = checklistByDate[today] || {};
  const meals = mealsByDate[today] || {};
  const hydration = hydByDate[today] || 0;
  const rawDay = daysBetween(startDate, today) + 1;
  const dayNum = clampN(rawDay, 1, 30);
  const completed = rawDay > 30;
  useEffect(() => { setPlanDay(dayNum); }, [dayNum]);

  useEffect(() => { (async () => {
    const s = await loadState();
    if (s) {
      if (typeof s.entered === "boolean") setEntered(s.entered);
      if (typeof s.onboarded === "boolean") setOnboarded(s.onboarded);
      if (s.prefs) setPrefs(s.prefs);
      if (s.feel) setFeel(s.feel); if (s.digestion) setDigestion(s.digestion);
      if (s.hydByDate) setHydByDate(s.hydByDate);
      if (s.history) setHistory(s.history);
      if (s.startDate) setStartDate(s.startDate); else if (s.entered) setStartDate(todayStr());
      if (s.checklistByDate) setChecklistByDate(s.checklistByDate);
      if (s.mealsByDate) setMealsByDate(s.mealsByDate);
      if (s.swaps) setSwaps(s.swaps); if (s.favs) setFavs(s.favs); if (s.notes) setNotes(s.notes);
      if (s.shopCheck) setShopCheck(s.shopCheck);
      if (s.pesoInicial) setPesoInicial(s.pesoInicial); if (s.pesoLog) setPesoLog(s.pesoLog); if (s.cintura) setCintura(s.cintura);
      if (s.reminders) setReminders(s.reminders);
      if (s.lastSaved) setLastSaved(s.lastSaved);
    }
  })(); }, []);

  const commit = (patch) => {
    const time = hhmm(); setLastSaved(time);
    const cur = { entered, onboarded, prefs, feel, digestion, hydByDate, history, startDate, checklistByDate, mealsByDate, swaps, favs, notes, shopCheck, pesoInicial, pesoLog, cintura, reminders, lastSaved: time, ...patch };
    saveState(cur);
  };

  /* recordatorios: dispara mientras la app está abierta */
  useEffect(() => {
    if (!entered) return;
    const tick = () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const now = hhmm(); const t = todayStr();
      const fire = (id, title, body) => { const key = `${t}-${id}`; if (reminders[id]?.on && reminders[id].hora === now && !firedRef.current.has(key)) { firedRef.current.add(key); try { new Notification(title, { body }); } catch (e) {} } };
      fire("agua", "💧 Hidratación", "Es momento de tomar agua.");
      fire("infusion", "🍵 Tu infusión", "Pausá y preparate una infusión antiinflamatoria.");
      fire("compras", "🛒 Lista de compras", "Armá la compra de la semana del Reset.");
    };
    const iv = setInterval(tick, 30000); tick();
    return () => clearInterval(iv);
  }, [entered, reminders]);

  const computeIndex = (f = feel, h = hydration, cl = checklist, ml = meals) => {
    const m = METRICS.reduce((a, x) => a + (f[x.k] === x.goodDir ? 2 : f[x.k] === "flat" ? 1 : 0), 0);
    const hyd = Math.min(2, (h / 2500) * 2);
    const chk = (CHECK.filter((x) => cl[x.id]).length / CHECK.length) * 1;
    const mealDone = (SLOTS.filter((s) => ml[s.k]).length / SLOTS.length) * 1;
    return Math.round(((m + hyd + chk + mealDone) / 10) * 100);
  };
  const recordIndex = (f, h, cl, ml) => { const idx = computeIndex(f, h, cl, ml); const nh = { ...history, [today]: { ...(history[today] || {}), idx } }; setHistory(nh); return nh; };

  const cycleMetric = (k) => { const o = ["down","flat","up"]; const nf = { ...feel, [k]: o[(o.indexOf(feel[k]) + 1) % 3] }; setFeel(nf); commit({ feel: nf, history: recordIndex(nf, hydration, checklist, meals) }); };
  const cycleDig = () => { const o = ["down","flat","up"]; const nv = o[(o.indexOf(digestion) + 1) % 3]; setDigestion(nv); commit({ digestion: nv }); };
  const addWater = (d) => { const n = clampN(hydration + d, 0, 2500); const nb = { ...hydByDate, [today]: n }; setHydByDate(nb); commit({ hydByDate: nb, history: recordIndex(feel, n, checklist, meals) }); };
  const toggleCheck = (id) => { const nc = { ...checklist, [id]: !checklist[id] }; const all = { ...checklistByDate, [today]: nc }; setChecklistByDate(all); commit({ checklistByDate: all, history: recordIndex(feel, hydration, nc, meals) }); };
  const toggleMeal = (k) => { const nm = { ...meals, [k]: !meals[k] }; const all = { ...mealsByDate, [today]: nm }; setMealsByDate(all); commit({ mealsByDate: all, history: recordIndex(feel, hydration, checklist, nm) }); };
  const toggleShop = (x) => { const n = { ...shopCheck, [x]: !shopCheck[x] }; setShopCheck(n); commit({ shopCheck: n }); };
  const togglePantry = (x) => setPantry((p) => (p.includes(x) ? p.filter((i) => i !== x) : [...p, x]));
  const toggleFav = (id) => { const n = { ...favs, [id]: !favs[id] }; setFavs(n); commit({ favs: n }); };
  const setNote = (id, v) => { const n = { ...notes, [id]: v }; setNotes(n); commit({ notes: n }); };
  const doSwap = (day, slot, id) => { const n = { ...swaps, [`${day}-${slot}`]: id }; setSwaps(n); commit({ swaps: n }); setSwapPick(null); };
  const registrarPeso = () => { const v = parseFloat(pesoInput); if (!v) return; const nl = [...pesoLog, { dia: ddmm(today), valor: v }].slice(-20); const nh = { ...history, [today]: { ...(history[today] || {}), peso: v } }; setPesoLog(nl); setHistory(nh); setPesoInput(""); const pi = pesoInicial || String(v); if (!pesoInicial) setPesoInicial(pi); commit({ pesoLog: nl, history: nh, pesoInicial: pi }); };
  const askNotif = async () => { if (typeof Notification === "undefined") return; try { const p = await Notification.requestPermission(); setNotif(p); } catch (e) {} };

  /* pools filtrados por preferencias */
  const fpools = {};
  SLOTS.forEach((s) => { const all = RECIPES.filter((r) => r.cat === s.k); const f = all.filter((r) => allowRecipe(r, prefs)); fpools[s.k] = (f.length >= 3 ? f : all).map((r) => r.id); });
  const okSnacks = SNACKS.filter((x) => !(prefs.alergias.nueces && /nuec|almendr/i.test(x)));
  const off = { desayuno: 0, almuerzo: 2, merienda: 1, cena: 0 };
  const getPlan = (d) => {
    const fase = d <= 10 ? PHASES[0] : d <= 20 ? PHASES[1] : PHASES[2]; const out = { fase };
    SLOTS.forEach((s) => { const ov = swaps[`${d}-${s.k}`]; const pool = fpools[s.k]; out[s.k] = ov && byId[ov] ? byId[ov] : byId[pool[(d - 1 + off[s.k]) % pool.length]]; });
    out.snack = okSnacks[(d - 1) % okSnacks.length]; return out;
  };

  const index = computeIndex();
  const phase = getPlan(dayNum).fase;
  const histDates = Object.keys(history).filter((d) => history[d].idx != null).sort();
  const chartData = histDates.slice(-14).map((d) => ({ dia: ddmm(d), valor: history[d].idx }));
  const months = [...new Set([...histDates.map(monthKey), monthKey(today)])].sort();
  const doneCheck = CHECK.filter((x) => checklist[x.id]).length;
  const doneMeals = SLOTS.filter((s) => meals[s.k]).length;

  const pantryKeys = pantry.map(norm);
  const matches = pantry.length ? RECIPES.map((r) => { const hit = r.key.filter((k) => pantryKeys.some((p) => norm(k).includes(p) || p.includes(norm(k)))); return { r, hit: hit.length, pct: Math.round((hit.length / r.key.length) * 100) }; }).filter((m) => m.hit > 0).sort((a, b) => b.pct - a.pct).slice(0, 12) : [];

  const easy = recipeCat === "facil"; const bonos = recipeCat === "bonos"; const favView = recipeCat === "favs";
  const filtered = RECIPES.filter((r) => {
    if (bonos) return false;
    if (favView) return favs[r.id] && (!query || norm(r.name).includes(norm(query)));
    const okCat = recipeCat === "todas" || recipeCat === "facil" || r.cat === recipeCat;
    const okEasy = !easy || r.min <= 10;
    const okQ = !query || norm(r.name).includes(norm(query)) || r.key.some((k) => norm(k).includes(norm(query)));
    return okCat && okEasy && okQ;
  });

  const shoppingForWeek = (week) => {
    const set = new Set(); week.days.forEach((d) => { const p = getPlan(d); SLOTS.forEach((s) => p[s.k] && p[s.k].key.forEach((k) => set.add(k))); });
    const b = { verduras: [], proteinas: [], frutas: [], secos: [], infusiones: [], condimentos: [] };
    [...set].sort().forEach((k) => { (b[CATMAP[norm(k)] || "condimentos"]).push(k); });
    b.secos.push("nueces"); b.frutas.push("fruta de estación");
    Object.keys(b).forEach((k) => { b[k] = [...new Set(b[k])]; }); return b;
  };

  const download = (fname, text) => { try { const blob = new Blob([text], { type: "text/plain;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fname; a.click(); } catch (e) {} };
  const exportListaTxt = () => { const w = WEEKS[shopWeek - 1]; const b = shoppingForWeek(w); let t = `LISTA DE COMPRAS — ${w.label} (días ${w.days[0]}-${w.days[w.days.length-1]})\n\n`; SHOPGROUPS.forEach((g) => { if (b[g.k].length) { t += `${g.label.toUpperCase()}\n`; b[g.k].forEach((i) => (t += `  [ ] ${i}\n`)); t += "\n"; } }); download(`lista-compras-S${w.n}.txt`, t); };
  const exportPlanTxt = () => { let t = "PLAN RESET ANTIINFLAMATORIO — 30 DÍAS\n\n"; for (let d = 1; d <= 30; d++) { const p = getPlan(d); t += `DÍA ${d} (Fase ${p.fase.n})\n  Desayuno: ${p.desayuno.name}\n  Almuerzo: ${p.almuerzo.name}\n  Merienda: ${p.merienda.name}\n  Cena: ${p.cena.name}\n  Snack: ${p.snack}\n\n`; } download("plan-30-dias.txt", t); };
  const exportBackup = () => { const cur = { entered, onboarded, prefs, feel, digestion, hydByDate, history, startDate, checklistByDate, mealsByDate, swaps, favs, notes, shopCheck, pesoInicial, pesoLog, cintura, reminders }; download(`reset-backup-${today}.json`, JSON.stringify(cur, null, 2)); };
  const importBackup = (e) => { const f = e.target.files?.[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { const s = JSON.parse(rd.result); Object.entries({ setEntered, setOnboarded, setPrefs, setFeel, setDigestion, setHydByDate, setHistory, setStartDate, setChecklistByDate, setMealsByDate, setSwaps, setFavs, setNotes, setShopCheck, setPesoInicial, setPesoLog, setCintura, setReminders }).forEach(() => {}); if (s.prefs) setPrefs(s.prefs); if (s.history) setHistory(s.history); if (s.startDate) setStartDate(s.startDate); if (s.checklistByDate) setChecklistByDate(s.checklistByDate); if (s.mealsByDate) setMealsByDate(s.mealsByDate); if (s.hydByDate) setHydByDate(s.hydByDate); if (s.swaps) setSwaps(s.swaps); if (s.favs) setFavs(s.favs); if (s.notes) setNotes(s.notes); if (s.pesoLog) setPesoLog(s.pesoLog); if (s.pesoInicial) setPesoInicial(s.pesoInicial); if (s.reminders) setReminders(s.reminders); commit(s); } catch (err) {} }; rd.readAsText(f); };

  /* UI */
  const Eyebrow = ({ children, color }) => (<span className="ff-m text-[10px] uppercase tracking-[0.18em]" style={{ color: color || c.inkSoft }}>{children}</span>);
  const Tag = ({ children }) => (<span className="ff-m text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: c.mint, color: c.green }}>{children}</span>);
  const Arrow = ({ dir, size = 16, color }) => dir === "up" ? <ArrowUp size={size} color={color} /> : dir === "down" ? <ArrowDown size={size} color={color} /> : <Minus size={size} color={color} />;
  const Thumb = ({ r, size = 56 }) => (<div className="rounded-xl shrink-0 overflow-hidden" style={{ width: size, height: size, background: r.img ? "#fff" : TINT[r.cat] }}>{r.img ? <img src={r.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: foodSVG(r) }} />}</div>);

  const RecipeCard = ({ r, slot, extra, onToggle, done }) => r ? (
    <div className="rounded-2xl p-3 flex items-center gap-3" style={{ backgroundColor: c.card, border: `1px solid ${done ? c.green : c.line}` }}>
      {onToggle && (<button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: done ? c.green : c.mintSoft, border: `1px solid ${done ? c.green : c.line}` }}>{done && <Check size={15} color="#fff" />}</button>)}
      <button onClick={() => setOpenRecipe(r)} className="flex items-center gap-3 flex-1 text-left min-w-0">
        <Thumb r={r} />
        <div className="min-w-0 flex-1">
          <Eyebrow>{slot || CATS[r.cat].label}</Eyebrow>
          <h3 className="ff-d text-[15px] leading-tight mt-0.5 truncate" style={{ color: c.ink }}>{r.name}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: c.inkSoft }}><span className="flex items-center gap-1"><Clock size={12} />{r.min}m</span>{extra}{favs[r.id] && <Heart size={12} fill={c.rose} color={c.rose} />}</div>
        </div>
      </button>
      {slot && <button onClick={(e) => { e.stopPropagation(); setSwapPick({ day: planDay, slot: SLOTS.find((s) => s.label === slot)?.k }); }} className="shrink-0 p-1.5 rounded-lg" style={{ backgroundColor: c.mintSoft }}><RefreshCw size={14} style={{ color: c.green }} /></button>}
    </div>
  ) : null;

  const Opt = ({ active, onClick, children }) => (<button onClick={onClick} className="px-3 py-2 rounded-xl text-sm transition" style={{ backgroundColor: active ? c.green : c.card, color: active ? "#fff" : c.ink, border: `1px solid ${active ? c.green : c.line}` }}>{children}</button>);

  /* BIENVENIDA */
  if (!entered) {
    const startApp = () => { const sd = startDate || todayStr(); setEntered(true); setStartDate(sd); commit({ entered: true, startDate: sd }); };
    return (<div className="ff-b min-h-screen w-full flex justify-center" style={{ backgroundColor: "#DCE7DF" }}><style>{FONTS}</style>
      <div className="w-full max-w-[420px] min-h-screen overflow-y-auto" style={{ backgroundColor: c.bg }}>
        <div className="px-6 pt-12 pb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: c.mint }}><Leaf size={14} style={{ color: c.green }} /><Eyebrow color={c.green}>Método inteligente · 30 días</Eyebrow></span>
          <h1 className="ff-d text-[34px] leading-[1.1] mt-5" style={{ color: c.ink }}>Desinflamá tu cuerpo y <span style={{ color: c.green }}>recuperá tu energía</span> en 30 días.</h1>
          <p className="text-sm leading-relaxed mt-4" style={{ color: c.inkSoft }}>Menú completo día por día, lista de compras semanal, recetas paso a paso y seguimiento diario. Hábitos reales y sostenibles, sin dietas extremas.</p>
          <button onClick={startApp} className="w-full mt-6 py-3.5 rounded-2xl font-semibold text-white active:scale-[0.99]" style={{ backgroundColor: c.green }}>Empezar mi Reset</button>
        </div>
        <div className="px-6 pb-10 space-y-4">
          <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${c.green}, ${c.greenDeep})` }}><Eyebrow color="#A7F3D0">Qué es el Reset</Eyebrow><p className="text-sm leading-relaxed text-white/90 mt-2">Un protocolo guiado de 30 días en 3 fases para comer de forma antiinflamatoria, mejorar tu digestión y tu energía con comidas simples y ricas.</p></div>
          <div className="rounded-2xl p-5" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-lg mb-2" style={{ color: c.ink }}>Para quién es</h3><ul className="space-y-1.5 text-sm" style={{ color: c.inkSoft }}>{["Te sentís hinchada, pesada o sin energía","Querés ordenar tu alimentación sin complicarte","Buscás hábitos sostenibles, no una dieta exprés","Cocinás poco y necesitás opciones rápidas"].map((x) => <li key={x} className="flex gap-2"><Check size={15} style={{ color: c.green }} className="shrink-0 mt-0.5" />{x}</li>)}</ul></div>
          <div className="rounded-2xl p-5" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-lg mb-2" style={{ color: c.ink }}>Qué podés esperar</h3><ul className="space-y-1.5 text-sm" style={{ color: c.inkSoft }}>{["Comidas simples que dejan de ser una carga","Más energía y mejor descanso","Una digestión más liviana","Una relación más tranquila con la comida"].map((x) => <li key={x} className="flex gap-2"><Sparkles size={15} style={{ color: c.green }} className="shrink-0 mt-0.5" />{x}</li>)}</ul><p className="ff-m text-[10px] mt-3" style={{ color: c.inkSoft }}>* Los resultados varían según cada persona.</p></div>
          <div className="rounded-2xl p-4 flex gap-3" style={{ backgroundColor: c.mintSoft, border: `1px solid ${c.line}` }}><ShieldCheck size={18} style={{ color: c.green }} className="shrink-0 mt-0.5" /><p className="text-xs leading-relaxed" style={{ color: c.inkSoft }}>Plan informativo y educativo. <b>No reemplaza la indicación de un médico ni nutricionista.</b> Ante cualquier condición de salud, embarazo o medicación, consultá con un profesional.</p></div>
          <button onClick={startApp} className="w-full py-3.5 rounded-2xl font-semibold text-white" style={{ backgroundColor: c.green }}>Empezar mi Reset</button>
        </div>
      </div></div>);
  }

  /* ONBOARDING */
  if (!onboarded) {
    const steps = [
      { q: "¿Cómo te alimentás?", render: () => (<div className="grid grid-cols-2 gap-2">{DIETAS.map(([k, l]) => <Opt key={k} active={prefs.dieta === k} onClick={() => setPrefs({ ...prefs, dieta: k })}>{l}</Opt>)}</div>) },
      { q: "¿Alguna alergia o algo que evitar?", render: () => (<div className="space-y-2">{[["nueces","Frutos secos"],["gluten","Gluten"]].map(([k, l]) => (<button key={k} onClick={() => setPrefs({ ...prefs, alergias: { ...prefs.alergias, [k]: !prefs.alergias[k] } })} className="w-full flex items-center gap-3 p-3 rounded-xl text-left" style={{ backgroundColor: c.card, border: `1px solid ${prefs.alergias[k] ? c.green : c.line}` }}><span className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: prefs.alergias[k] ? c.green : "transparent", border: `1.5px solid ${prefs.alergias[k] ? c.green : c.line}` }}>{prefs.alergias[k] && <Check size={13} color="#fff" />}</span><span className="text-sm" style={{ color: c.ink }}>{l}</span></button>))}<p className="ff-m text-[10px]" style={{ color: c.inkSoft }}>El plan ya es libre de lácteos.</p></div>) },
      { q: "¿Para cuántas porciones cocinás?", render: () => (<div className="grid grid-cols-4 gap-2">{[1, 2, 4, 6].map((n) => <Opt key={n} active={prefs.porciones === n} onClick={() => setPrefs({ ...prefs, porciones: n })}>{n}</Opt>)}</div>) },
      { q: "¿Tu objetivo principal?", render: () => (<div className="grid grid-cols-1 gap-2">{OBJETIVOS.map(([k, l]) => <Opt key={k} active={prefs.objetivo === k} onClick={() => setPrefs({ ...prefs, objetivo: k })}>{l}</Opt>)}</div>) },
    ];
    const st = steps[obStep];
    const finish = () => { setOnboarded(true); commit({ onboarded: true, prefs }); };
    return (<div className="ff-b min-h-screen w-full flex justify-center" style={{ backgroundColor: "#DCE7DF" }}><style>{FONTS}</style>
      <div className="w-full max-w-[420px] min-h-screen flex flex-col px-6 pt-12 pb-8" style={{ backgroundColor: c.bg }}>
        <Eyebrow color={c.green}>Personalizá tu plan · {obStep + 1}/4</Eyebrow>
        <div className="h-1.5 rounded-full mt-3 mb-8 overflow-hidden" style={{ backgroundColor: c.mint }}><div className="h-full rounded-full" style={{ width: `${((obStep + 1) / 4) * 100}%`, backgroundColor: c.green }} /></div>
        <h2 className="ff-d text-[26px] leading-tight mb-6" style={{ color: c.ink }}>{st.q}</h2>
        <div className="flex-1">{st.render()}</div>
        <div className="flex gap-2 mt-6">
          {obStep > 0 && <button onClick={() => setObStep(obStep - 1)} className="px-5 py-3 rounded-2xl" style={{ backgroundColor: c.card, color: c.ink, border: `1px solid ${c.line}` }}>Atrás</button>}
          <button onClick={() => (obStep < 3 ? setObStep(obStep + 1) : finish())} className="flex-1 py-3 rounded-2xl font-semibold text-white" style={{ backgroundColor: c.green }}>{obStep < 3 ? "Siguiente" : "Crear mi plan"}</button>
        </div>
      </div></div>);
  }

  /* APP */
  const plan = getPlan(planDay);
  return (<div className="ff-b min-h-screen w-full flex justify-center" style={{ backgroundColor: "#DCE7DF" }}><style>{FONTS}</style>
    <div className="w-full max-w-[420px] h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: c.bg, height: "100dvh" }}>

      <div className="px-5 pt-6 pb-3 z-20 flex items-center justify-between" style={{ backgroundColor: c.bg, borderBottom: `1px solid ${c.line}` }}>
        <div className="flex items-center gap-2"><span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.green }}><Leaf size={18} color="#fff" /></span><div><p className="ff-d text-[16px] leading-none" style={{ color: c.ink }}>Reset Antiinflamatorio</p><p className="ff-m text-[9px] tracking-[0.18em] uppercase" style={{ color: c.inkSoft }}>// 30 días</p></div></div>
        <button onClick={() => setSettings(true)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><Settings size={17} style={{ color: c.inkSoft }} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-6">

        {tab === "hoy" && (<div className="space-y-5">
          <div><Eyebrow>{fmtLong(today)}</Eyebrow><h2 className="ff-d text-[26px] leading-tight mt-1" style={{ color: c.ink }}>Tu bitácora de hoy</h2><p className="ff-m text-[11px] mt-1" style={{ color: c.green }}>{completed ? "Reset completado · Día 30 de 30" : `Día ${dayNum} de 30 · Fase ${phase.n}`}</p></div>
          <div className="rounded-3xl p-5" style={{ background: `linear-gradient(135deg, ${c.green}, ${c.greenDeep})` }}><Eyebrow color="#A7F3D0">Índice de desinflamación</Eyebrow><div className="flex items-end justify-between mt-1"><div className="flex items-baseline gap-1"><span className="ff-d text-[44px] leading-none text-white">{index}</span><span className="ff-m text-sm text-white/70">%</span></div><span className="ff-m text-[10px] text-white/70">{phase.range} · {phase.label}</span></div><div className="h-2 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}><div className="h-full rounded-full" style={{ width: `${index}%`, backgroundColor: c.accent }} /></div></div>

          <div>
            <div className="flex items-center justify-between mb-3"><h3 className="ff-d text-[17px]" style={{ color: c.ink }}>Menú de hoy</h3><span className="ff-m text-sm" style={{ color: c.green }}>{doneMeals}/4</span></div>
            <div className="space-y-2.5">
              <RecipeCard r={plan.desayuno} slot="Desayuno" done={meals.desayuno} onToggle={() => toggleMeal("desayuno")} />
              <RecipeCard r={plan.almuerzo} slot="Almuerzo" done={meals.almuerzo} onToggle={() => toggleMeal("almuerzo")} />
              <RecipeCard r={plan.merienda} slot="Merienda" done={meals.merienda} onToggle={() => toggleMeal("merienda")} />
              <RecipeCard r={plan.cena} slot="Cena" done={meals.cena} onToggle={() => toggleMeal("cena")} />
              <div className="rounded-2xl p-3 flex items-center gap-3" style={{ backgroundColor: c.mintSoft, border: `1px dashed ${c.line}` }}><Apple size={16} style={{ color: c.green }} /><div><Eyebrow>Snack opcional</Eyebrow><p className="text-sm" style={{ color: c.ink }}>{plan.snack}</p></div></div>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><div className="flex items-center justify-between mb-3"><h3 className="ff-d text-[17px]" style={{ color: c.ink }}>¿Cómo te sentís?</h3><Eyebrow>tocá para cambiar</Eyebrow></div><div className="grid grid-cols-3 gap-2.5">{METRICS.map((m) => { const v = feel[m.k]; const good = v === m.goodDir; const col = v === "flat" ? c.inkSoft : good ? c.green : c.rose; return (<button key={m.k} onClick={() => cycleMetric(m.k)} className="rounded-xl p-3 flex flex-col items-center gap-1 active:scale-95" style={{ backgroundColor: c.mintSoft, border: `1px solid ${good ? c.green : c.line}` }}><span className="ff-m text-[10px] uppercase tracking-wider" style={{ color: c.inkSoft }}>{m.label}</span><Arrow dir={v} size={22} color={col} /></button>); })}</div></div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><div className="flex items-center justify-between mb-2"><h3 className="ff-d text-[17px] flex items-center gap-2" style={{ color: c.ink }}><Droplet size={16} style={{ color: c.green }} /> Hidratación</h3><span className="ff-m text-sm" style={{ color: c.ink }}>{(hydration / 1000).toFixed(1)} / 2.5 L</span></div><div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: c.mint }}><div className="h-full rounded-full" style={{ width: `${(hydration / 2500) * 100}%`, backgroundColor: c.green }} /></div><div className="flex gap-2"><button onClick={() => addWater(-250)} className="flex-1 py-2 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.mintSoft, color: c.ink }}><Minus size={16} /></button><button onClick={() => addWater(250)} className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1" style={{ backgroundColor: c.green, color: "#fff" }}><Plus size={16} /> 250 ml</button></div></div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><div className="flex items-center justify-between mb-3"><h3 className="ff-d text-[17px]" style={{ color: c.ink }}>Checklist diario</h3><span className="ff-m text-sm" style={{ color: c.green }}>{doneCheck}/{CHECK.length}</span></div><div className="space-y-1.5">{CHECK.map((h) => { const Hi = h.icon; const on = checklist[h.id]; return (<button key={h.id} onClick={() => toggleCheck(h.id)} className="w-full flex items-center gap-3 p-1.5 rounded-xl"><span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: on ? c.green : c.mintSoft }}>{on ? <Check size={16} color="#fff" /> : <Hi size={16} style={{ color: c.inkSoft }} />}</span><span className="text-sm flex-1 text-left" style={{ color: on ? c.inkSoft : c.ink, textDecoration: on ? "line-through" : "none" }}>{h.label}</span></button>); })}</div></div>

          <button onClick={() => { setRecipeCat("facil"); setTab("recetas"); }} className="w-full rounded-2xl p-4 flex items-center gap-3 text-left" style={{ backgroundColor: c.mint, border: `1px solid ${c.line}` }}><Zap size={18} style={{ color: c.green }} /><div className="flex-1"><h3 className="ff-d text-[15px]" style={{ color: c.ink }}>¿Cocinás poco?</h3><p className="text-xs" style={{ color: c.inkSoft }}>Modo fácil: recetas de 10 minutos.</p></div><ChevronRight size={18} style={{ color: c.inkSoft }} /></button>
        </div>)}

        {tab === "plan" && (<div className="space-y-4">
          <div className="flex items-start justify-between"><div><Eyebrow>Menú día por día</Eyebrow><h2 className="ff-d text-[26px] leading-tight" style={{ color: c.ink }}>Plan de 30 días</h2></div><button onClick={exportPlanTxt} className="p-2 rounded-xl mt-1" style={{ backgroundColor: c.mintSoft }}><Download size={16} style={{ color: c.green }} /></button></div>
          <div className="rounded-xl p-3 flex gap-2" style={{ backgroundColor: c.mintSoft, border: `1px solid ${c.line}` }}><Repeat size={15} style={{ color: c.green }} className="shrink-0 mt-0.5" /><p className="text-xs leading-relaxed" style={{ color: c.inkSoft }}>Rotación inteligente: el plan combina las recetas que mejor funcionan. Tocá <RefreshCw size={11} className="inline" style={{ color: c.green }} /> en cualquier comida para cambiarla.</p></div>
          <div className="flex gap-2 overflow-x-auto pb-1">{Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (<button key={d} onClick={() => setPlanDay(d)} className="shrink-0 w-11 h-11 rounded-xl ff-m text-sm" style={{ backgroundColor: planDay === d ? c.green : c.card, color: planDay === d ? "#fff" : c.inkSoft, border: `1px solid ${planDay === d ? c.green : (d === dayNum ? c.accent : c.line)}` }}>{d}</button>))}</div>
          <div className="rounded-2xl p-3 flex items-center justify-between" style={{ backgroundColor: c.mintSoft, border: `1px solid ${c.line}` }}><div><span className="ff-d text-lg" style={{ color: c.ink }}>Día {planDay}</span><p className="ff-m text-[10px] uppercase tracking-wider" style={{ color: c.green }}>{fmtShort(addDaysISO(startDate, planDay - 1))}{planDay === dayNum ? " · hoy" : ""}</p></div><Eyebrow color={c.green}>Fase {plan.fase.n}</Eyebrow></div>
          <div className="space-y-2.5">
            <RecipeCard r={plan.desayuno} slot="Desayuno" /><RecipeCard r={plan.almuerzo} slot="Almuerzo" /><RecipeCard r={plan.merienda} slot="Merienda" /><RecipeCard r={plan.cena} slot="Cena" />
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ backgroundColor: c.mintSoft, border: `1px dashed ${c.line}` }}><Apple size={16} style={{ color: c.green }} /><div><Eyebrow>Snack opcional</Eyebrow><p className="text-sm" style={{ color: c.ink }}>{plan.snack}</p></div></div>
          </div>
        </div>)}

        {tab === "recetas" && (<div className="space-y-4">
          <div><Eyebrow>Recetario · 30 días</Eyebrow><h2 className="ff-d text-[26px] leading-tight" style={{ color: c.ink }}>Recetas</h2></div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><Search size={16} style={{ color: c.inkSoft }} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar receta o ingrediente" className="flex-1 bg-transparent outline-none text-sm" style={{ color: c.ink }} />{query && <button onClick={() => setQuery("")}><X size={15} style={{ color: c.inkSoft }} /></button>}</div>
          <div className="flex gap-2 overflow-x-auto pb-1">{[["todas","Todas"],["favs","♥ Favoritos"],["facil","⚡ Fáciles"],["bonos","★ Bonos"],...Object.entries(CATS).map(([k, v]) => [k, v.label])].map(([k, l]) => (<button key={k} onClick={() => setRecipeCat(k)} className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap" style={{ backgroundColor: recipeCat === k ? c.green : c.card, color: recipeCat === k ? "#fff" : c.inkSoft, border: `1px solid ${recipeCat === k ? c.green : c.line}` }}>{l}</button>))}</div>
          {bonos ? (<div className="space-y-5">{BONOS.map((b) => { const Bi = b.icon; return (<div key={b.t}><div className="flex items-center gap-2 mb-2"><Bi size={16} style={{ color: c.green }} /><h3 className="ff-d text-[17px]" style={{ color: c.ink }}>{b.t}</h3></div><div className="space-y-2.5">{b.ids.map((id) => <RecipeCard key={id} r={byId[id]} />)}</div></div>); })}</div>) : (<>
            {easy && <div className="rounded-2xl p-4" style={{ backgroundColor: c.mint, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[15px] mb-1" style={{ color: c.ink }}>Modo principiante</h3><p className="text-xs leading-relaxed" style={{ color: c.inkSoft }}>Recetas de 10 minutos o menos, varias sin cocción. Tip: dejá lavados los vegetales y cocida una tanda de quinoa o arroz integral.</p></div>}
            <Eyebrow>{filtered.length} recetas</Eyebrow>
            <div className="space-y-2.5">{filtered.map((r) => <RecipeCard key={r.id} r={r} />)}{filtered.length === 0 && <p className="text-sm text-center py-10" style={{ color: c.inkSoft }}>{favView ? "Todavía no marcaste favoritos. Tocá el ♥ en una receta." : "Sin resultados."}</p>}</div>
          </>)}
          <div className="pt-2"><h3 className="ff-d text-[17px] mb-1" style={{ color: c.ink }}>Mi heladera</h3><p className="text-sm mb-3" style={{ color: c.inkSoft }}>Marcá lo que tenés y te armamos recetas posibles.</p><div className="flex flex-wrap gap-2">{PANTRY.map((x) => { const on = pantry.includes(x); return (<button key={x} onClick={() => togglePantry(x)} className="px-3 py-1.5 rounded-full text-sm active:scale-95" style={{ backgroundColor: on ? c.green : c.card, color: on ? "#fff" : c.ink, border: `1px solid ${on ? c.green : c.line}` }}>{x}</button>); })}</div>{matches.length > 0 && <div className="space-y-2.5 mt-3">{matches.map(({ r, pct }) => <RecipeCard key={r.id} r={r} extra={<span className="flex items-center gap-1 ff-m" style={{ color: c.green }}><Sparkles size={12} />{pct}%</span>} />)}</div>}</div>
        </div>)}

        {tab === "compras" && (<div className="space-y-4">
          <div className="flex items-start justify-between"><div><Eyebrow>Compras & guía</Eyebrow><h2 className="ff-d text-[26px] leading-tight" style={{ color: c.ink }}>Lista de compras</h2></div>{shopTab === "lista" && <button onClick={exportListaTxt} className="p-2 rounded-xl mt-1" style={{ backgroundColor: c.mintSoft }}><Download size={16} style={{ color: c.green }} /></button>}</div>
          <div className="flex gap-2">{[["lista","Semanal"],["reemplazos","Reemplazos"],["guia","Permitidos"]].map(([k, l]) => (<button key={k} onClick={() => setShopTab(k)} className="flex-1 py-2 rounded-xl text-sm" style={{ backgroundColor: shopTab === k ? c.green : c.card, color: shopTab === k ? "#fff" : c.inkSoft, border: `1px solid ${shopTab === k ? c.green : c.line}` }}>{l}</button>))}</div>
          {shopTab === "lista" && (<><div className="flex gap-2">{WEEKS.map((w) => (<button key={w.n} onClick={() => setShopWeek(w.n)} className="flex-1 py-1.5 rounded-lg ff-m text-xs" style={{ backgroundColor: shopWeek === w.n ? c.mint : c.card, color: shopWeek === w.n ? c.green : c.inkSoft, border: `1px solid ${shopWeek === w.n ? c.green : c.line}` }}>S{w.n}</button>))}</div>
            {(() => { const w = WEEKS[shopWeek - 1]; const b = shoppingForWeek(w); return (<div className="space-y-3"><Eyebrow>{w.label} · días {w.days[0]}–{w.days[w.days.length - 1]}</Eyebrow>{SHOPGROUPS.map((g) => b[g.k].length ? (<div key={g.k} className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[16px] mb-2" style={{ color: c.green }}>{g.label}</h3><div className="space-y-1.5">{b[g.k].map((it) => { const id = `${w.n}-${it}`; const on = shopCheck[id]; return (<button key={id} onClick={() => toggleShop(id)} className="w-full flex items-center gap-3 py-1"><span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: on ? c.green : "transparent", border: `1.5px solid ${on ? c.green : c.line}` }}>{on && <Check size={13} color="#fff" />}</span><span className="text-sm capitalize" style={{ color: on ? c.inkSoft : c.ink, textDecoration: on ? "line-through" : "none" }}>{it}</span></button>); })}</div></div>) : null)}</div>); })()}</>)}
          {shopTab === "reemplazos" && (<div className="space-y-2"><div className="rounded-2xl p-4 flex gap-3" style={{ backgroundColor: c.mintSoft, border: `1px solid ${c.line}` }}><Repeat size={18} style={{ color: c.green }} className="shrink-0 mt-0.5" /><p className="text-xs leading-relaxed" style={{ color: c.inkSoft }}>¿No tenés un ingrediente? Cambialo sin perder el espíritu del plan.</p></div>{SUBS.map(([f, t]) => (<div key={f} className="rounded-2xl p-3.5" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><p className="text-sm" style={{ color: c.ink }}>Si no tenés <b>{f}</b>…</p><p className="text-sm flex items-start gap-1.5 mt-0.5" style={{ color: c.green }}><ChevronRight size={15} className="shrink-0 mt-0.5" />{t}</p></div>))}</div>)}
          {shopTab === "guia" && (<div className="space-y-3"><div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.green}` }}><h3 className="ff-d text-[16px] mb-2 flex items-center gap-2" style={{ color: c.green }}><Check size={16} /> Permitidos</h3><ul className="space-y-1 text-sm" style={{ color: c.ink }}>{GUIDE.permitidos.map((x) => <li key={x} className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: c.green }} />{x}</li>)}</ul></div><div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[16px] mb-2 flex items-center gap-2" style={{ color: c.amber }}><Minus size={16} /> Moderar</h3><ul className="space-y-1 text-sm" style={{ color: c.ink }}>{GUIDE.moderar.map((x) => <li key={x} className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: c.amber }} />{x}</li>)}</ul></div><div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[16px] mb-2 flex items-center gap-2" style={{ color: c.rose }}><X size={16} /> Evitar durante el reset</h3><ul className="space-y-1 text-sm" style={{ color: c.ink }}>{GUIDE.evitar.map((x) => <li key={x} className="flex gap-2"><X size={13} style={{ color: c.rose }} className="shrink-0 mt-1" />{x}</li>)}</ul></div></div>)}
        </div>)}

        {tab === "progreso" && (<div className="space-y-4">
          <div><Eyebrow>Seguimiento</Eyebrow><h2 className="ff-d text-[26px] leading-tight" style={{ color: c.ink }}>Tu progreso</h2></div>
          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><div className="flex items-baseline justify-between mb-3"><h3 className="ff-d text-[17px]" style={{ color: c.ink }}>Índice de desinflamación</h3><span className="ff-d text-2xl" style={{ color: c.green }}>{index}%</span></div>
            {chartData.length >= 2 ? (<div style={{ width: "100%", height: 150 }}><ResponsiveContainer><AreaChart data={chartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.green} stopOpacity={0.4} /><stop offset="100%" stopColor={c.green} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="dia" tick={{ fontSize: 10, fill: c.inkSoft }} axisLine={false} tickLine={false} interval={1} /><YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: c.inkSoft }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${c.line}`, fontSize: 12 }} /><Area type="monotone" dataKey="valor" stroke={c.green} strokeWidth={2.5} fill="url(#g)" /></AreaChart></ResponsiveContainer></div>) : (<p className="text-sm py-6 text-center" style={{ color: c.inkSoft }}>Registrá tus señales unos días para ver tu evolución.</p>)}</div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[17px] mb-2" style={{ color: c.ink }}>Resumen mes a mes</h3><div className="flex gap-2 overflow-x-auto pb-1 mb-3">{months.map((mk) => (<button key={mk} onClick={() => setSelMonth(mk)} className="shrink-0 px-3 py-1.5 rounded-full text-xs whitespace-nowrap" style={{ backgroundColor: selMonth === mk ? c.green : c.card, color: selMonth === mk ? "#fff" : c.inkSoft, border: `1px solid ${selMonth === mk ? c.green : c.line}` }}>{monthLabel(mk)}</button>))}</div>{(() => { const ds = Object.keys(history).filter((d) => monthKey(d) === selMonth).sort(); const idxs = ds.map((d) => history[d].idx).filter((x) => x != null); const pesos = ds.map((d) => history[d].peso).filter((x) => x != null); const avg = idxs.length ? Math.round(idxs.reduce((a, b) => a + b, 0) / idxs.length) : null; const St = ({ l, v }) => (<div className="rounded-xl p-3 text-center" style={{ backgroundColor: c.mintSoft }}><p className="ff-d text-xl" style={{ color: c.green }}>{v}</p><p className="ff-m text-[8px] uppercase tracking-wide mt-0.5" style={{ color: c.inkSoft }}>{l}</p></div>); return (<div className="grid grid-cols-3 gap-2"><St l="Días" v={ds.length} /><St l="Índice prom." v={avg != null ? avg + "%" : "—"} /><St l="Peso (kg)" v={pesos.length ? `${pesos[0]}→${pesos[pesos.length - 1]}` : "—"} /></div>); })()}</div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[17px] mb-3" style={{ color: c.ink }}>Señales de hoy</h3><div className="grid grid-cols-4 gap-2">{[...METRICS, { k: "digestion", label: "Digestión", goodDir: "up" }].map((m) => { const v = m.k === "digestion" ? digestion : feel[m.k]; const good = v === m.goodDir; const col = v === "flat" ? c.inkSoft : good ? c.green : c.rose; const oc = m.k === "digestion" ? cycleDig : () => cycleMetric(m.k); return (<button key={m.k} onClick={oc} className="rounded-xl p-2 flex flex-col items-center gap-1" style={{ backgroundColor: c.mintSoft, border: `1px solid ${good ? c.green : c.line}` }}><span className="ff-m text-[8px] uppercase tracking-wide text-center" style={{ color: c.inkSoft }}>{m.label}</span><Arrow dir={v} size={18} color={col} /></button>); })}</div></div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[17px] mb-1" style={{ color: c.ink }}>Peso y medidas <span className="ff-m text-[10px]" style={{ color: c.inkSoft }}>· opcional</span></h3><p className="text-xs mb-3" style={{ color: c.inkSoft }}>Sin metas. Registralo solo si te sirve para verte en perspectiva.</p><div className="flex gap-2 mb-2"><input value={pesoInput} onChange={(e) => setPesoInput(e.target.value)} inputMode="decimal" placeholder="Peso (kg)" className="flex-1 rounded-xl px-3 py-2 text-sm outline-none" style={{ backgroundColor: c.mintSoft, color: c.ink, border: `1px solid ${c.line}` }} /><button onClick={registrarPeso} className="px-4 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: c.green }}>Registrar</button></div><input value={cintura} onChange={(e) => { setCintura(e.target.value); commit({ cintura: e.target.value }); }} inputMode="decimal" placeholder="Cintura (cm) — opcional" className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-2" style={{ backgroundColor: c.mintSoft, color: c.ink, border: `1px solid ${c.line}` }} />{pesoInicial && <p className="ff-m text-xs" style={{ color: c.inkSoft }}>Inicial: {pesoInicial} kg{pesoLog.length ? ` · último: ${pesoLog[pesoLog.length - 1].valor} kg` : ""}</p>}</div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><div className="flex items-center justify-between mb-3"><h3 className="ff-d text-[17px]" style={{ color: c.ink }}>Protocolo · 30 días</h3><span className="ff-m text-sm" style={{ color: c.green }}>Día {dayNum}/30</span></div><div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: c.mint }}><div className="h-full rounded-full" style={{ width: `${Math.min(100, (dayNum / 30) * 100)}%`, backgroundColor: c.accent }} /></div><div className="flex items-center gap-2 mb-3"><label className="ff-m text-[11px] shrink-0" style={{ color: c.inkSoft }}>Empecé el</label><input type="date" value={startDate} max={todayStr()} onChange={(e) => { const v = e.target.value || todayStr(); setStartDate(v); commit({ startDate: v }); }} className="flex-1 rounded-lg px-2 py-1 text-sm outline-none" style={{ backgroundColor: c.mintSoft, color: c.ink, border: `1px solid ${c.line}` }} /><button onClick={() => { const v = todayStr(); setStartDate(v); commit({ startDate: v }); }} className="px-3 py-1.5 rounded-lg text-xs shrink-0" style={{ backgroundColor: c.mint, color: c.green }}>Reiniciar</button></div><div className="space-y-2">{PHASES.map((p) => { const active = p.n === phase.n; return (<div key={p.n} className="flex items-center gap-3 rounded-xl p-2.5" style={{ backgroundColor: active ? c.mintSoft : "transparent", border: `1px solid ${active ? c.green : c.line}` }}><span className="w-7 h-7 rounded-lg flex items-center justify-center ff-d text-sm shrink-0" style={{ backgroundColor: active ? c.green : c.mint, color: active ? "#fff" : c.green }}>{p.n}</span><div><p className="text-sm" style={{ color: c.ink }}>{p.label}</p><Eyebrow>{p.range}</Eyebrow></div></div>); })}</div></div>

          <div className="rounded-2xl p-4 flex gap-3" style={{ backgroundColor: c.mintSoft, border: `1px solid ${c.line}` }}><Info size={18} style={{ color: c.green }} className="shrink-0 mt-0.5" /><p className="text-xs leading-relaxed" style={{ color: c.inkSoft }}>El índice es un <b>autoinforme</b> de cómo te sentís; no mide cortisol. Este plan es informativo y no reemplaza la indicación de un profesional de la salud.</p></div>
        </div>)}
      </div>

      <div className="shrink-0 z-20 px-2 py-2 flex justify-around" style={{ backgroundColor: c.card, borderTop: `1px solid ${c.line}` }}>{[{ k: "hoy", i: Home, l: "Hoy" },{ k: "plan", i: CalendarDays, l: "Plan" },{ k: "recetas", i: BookOpen, l: "Recetas" },{ k: "compras", i: ShoppingCart, l: "Compras" },{ k: "progreso", i: Activity, l: "Progreso" }].map((t) => { const on = tab === t.k; const Ti = t.i; return (<button key={t.k} onClick={() => setTab(t.k)} className="flex flex-col items-center gap-0.5 px-1 py-1 rounded-xl flex-1"><Ti size={20} style={{ color: on ? c.green : c.inkSoft }} /><span className="ff-m text-[9px]" style={{ color: on ? c.green : c.inkSoft, fontWeight: on ? 700 : 400 }}>{t.l}</span></button>); })}</div>

      {/* detalle receta */}
      {openRecipe && (<div className="absolute inset-0 z-30 flex flex-col" style={{ backgroundColor: c.bg }}>
        <div className="px-5 pt-6 pb-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.line}` }}><button onClick={() => setOpenRecipe(null)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><ChevronLeft size={18} style={{ color: c.ink }} /></button><button onClick={() => toggleFav(openRecipe.id)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><Heart size={17} fill={favs[openRecipe.id] ? c.rose : "none"} color={favs[openRecipe.id] ? c.rose : c.inkSoft} /></button></div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div className="h-40 rounded-2xl overflow-hidden" style={{ background: openRecipe.img ? "#fff" : TINT[openRecipe.cat] }}>{openRecipe.img ? <img src={openRecipe.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: foodSVG(openRecipe) }} />}</div>
          <div><h2 className="ff-d text-[24px] leading-tight" style={{ color: c.ink }}>{openRecipe.name}</h2><div className="flex items-center gap-4 mt-2 text-sm" style={{ color: c.inkSoft }}><span className="flex items-center gap-1"><Clock size={14} />{openRecipe.min} min</span><span className="flex items-center gap-1"><Users size={14} />{openRecipe.serv} porc.</span></div><div className="flex flex-wrap gap-1.5 mt-3">{openRecipe.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>{prefs.porciones !== openRecipe.serv && <p className="ff-m text-[11px] mt-2" style={{ color: c.inkSoft }}>Tu hogar: {prefs.porciones} porciones — ajustá las cantidades.</p>}</div>
          <div><h3 className="ff-d text-[17px] mb-2" style={{ color: c.green }}>Ingredientes</h3><ul className="space-y-2">{openRecipe.ing.map((x, i) => (<li key={i} className="flex items-start gap-2 text-sm" style={{ color: c.ink }}><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: c.accent }} />{x}</li>))}</ul></div>
          <div><h3 className="ff-d text-[17px] mb-2" style={{ color: c.green }}>Paso a paso</h3><ol className="space-y-3">{openRecipe.steps.map((x, i) => (<li key={i} className="flex gap-3 text-sm" style={{ color: c.ink }}><span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 ff-m text-xs" style={{ backgroundColor: c.green, color: "#fff" }}>{i + 1}</span><span className="pt-0.5 leading-relaxed">{x}</span></li>))}</ol></div>
          <div><h3 className="ff-d text-[17px] mb-2 flex items-center gap-2" style={{ color: c.green }}><Pencil size={15} /> Mis notas</h3><textarea value={notes[openRecipe.id] || ""} onChange={(e) => setNote(openRecipe.id, e.target.value)} placeholder="Anotá cambios, gustos, qué le agregaste…" rows={3} className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none" style={{ backgroundColor: c.mintSoft, color: c.ink, border: `1px solid ${c.line}` }} /></div>
        </div>
      </div>)}

      {/* swap picker */}
      {swapPick && swapPick.slot && (<div className="absolute inset-0 z-40 flex flex-col" style={{ backgroundColor: c.bg }}>
        <div className="px-5 pt-6 pb-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${c.line}` }}><button onClick={() => setSwapPick(null)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><X size={18} style={{ color: c.ink }} /></button><div><Eyebrow>Cambiar {SLOTS.find((s) => s.k === swapPick.slot)?.label} · Día {swapPick.day}</Eyebrow><h2 className="ff-d text-lg" style={{ color: c.ink }}>Elegí otra receta</h2></div></div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2.5">{fpools[swapPick.slot].map((id) => byId[id]).map((r) => (<button key={r.id} onClick={() => doSwap(swapPick.day, swapPick.slot, r.id)} className="w-full"><RecipeCard r={r} /></button>))}</div>
      </div>)}

      {/* ajustes */}
      {settings && (<div className="absolute inset-0 z-40 flex flex-col" style={{ backgroundColor: c.bg }}>
        <div className="px-5 pt-6 pb-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${c.line}` }}><button onClick={() => setSettings(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><X size={18} style={{ color: c.ink }} /></button><h2 className="ff-d text-xl" style={{ color: c.ink }}>Ajustes</h2></div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[16px] mb-3" style={{ color: c.ink }}>Mi plan</h3>
            <Eyebrow>Alimentación</Eyebrow><div className="grid grid-cols-2 gap-2 mt-1 mb-3">{DIETAS.map(([k, l]) => <Opt key={k} active={prefs.dieta === k} onClick={() => { const p = { ...prefs, dieta: k }; setPrefs(p); commit({ prefs: p }); }}>{l}</Opt>)}</div>
            <Eyebrow>Evitar</Eyebrow><div className="flex gap-2 mt-1 mb-3">{[["nueces","Frutos secos"],["gluten","Gluten"]].map(([k, l]) => <Opt key={k} active={prefs.alergias[k]} onClick={() => { const p = { ...prefs, alergias: { ...prefs.alergias, [k]: !prefs.alergias[k] } }; setPrefs(p); commit({ prefs: p }); }}>{l}</Opt>)}</div>
            <Eyebrow>Porciones</Eyebrow><div className="grid grid-cols-4 gap-2 mt-1">{[1, 2, 4, 6].map((n) => <Opt key={n} active={prefs.porciones === n} onClick={() => { const p = { ...prefs, porciones: n }; setPrefs(p); commit({ prefs: p }); }}>{n}</Opt>)}</div>
          </div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[16px] mb-2 flex items-center gap-2" style={{ color: c.ink }}><Bell size={16} style={{ color: c.green }} /> Recordatorios</h3>
            {notif !== "granted" && <button onClick={askNotif} className="w-full py-2 rounded-xl text-sm font-medium text-white mb-3" style={{ backgroundColor: c.green }}>Activar notificaciones</button>}
            {[["agua","Tomar agua"],["infusion","Infusión"],["compras","Armar la compra"]].map(([k, l]) => (<div key={k} className="flex items-center gap-2 py-1.5"><button onClick={() => { const r = { ...reminders, [k]: { ...reminders[k], on: !reminders[k].on } }; setReminders(r); commit({ reminders: r }); }} className="w-10 h-6 rounded-full flex items-center px-0.5 transition" style={{ backgroundColor: reminders[k].on ? c.green : c.line }}><span className="w-5 h-5 rounded-full bg-white transition" style={{ marginLeft: reminders[k].on ? 16 : 0 }} /></button><span className="text-sm flex-1" style={{ color: c.ink }}>{l}</span><input type="time" value={reminders[k].hora} onChange={(e) => { const r = { ...reminders, [k]: { ...reminders[k], hora: e.target.value } }; setReminders(r); commit({ reminders: r }); }} className="rounded-lg px-2 py-1 text-sm outline-none" style={{ backgroundColor: c.mintSoft, color: c.ink, border: `1px solid ${c.line}` }} /></div>))}
            <p className="ff-m text-[10px] mt-2" style={{ color: c.inkSoft }}>Para recibirlos con la app cerrada, instalala en tu pantalla de inicio (en iPhone las notificaciones web son limitadas).</p>
          </div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}><h3 className="ff-d text-[16px] mb-3" style={{ color: c.ink }}>Tus datos</h3>
            <div className="grid grid-cols-2 gap-2 mb-2"><button onClick={exportPlanTxt} className="py-2 rounded-xl text-sm flex items-center justify-center gap-1.5" style={{ backgroundColor: c.mintSoft, color: c.green }}><Download size={14} /> Plan .txt</button><button onClick={exportListaTxt} className="py-2 rounded-xl text-sm flex items-center justify-center gap-1.5" style={{ backgroundColor: c.mintSoft, color: c.green }}><Download size={14} /> Compras .txt</button></div>
            <button onClick={exportBackup} className="w-full py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 mb-2" style={{ backgroundColor: c.green, color: "#fff" }}><Download size={14} /> Descargar copia de seguridad</button>
            <label className="w-full py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer" style={{ backgroundColor: c.card, color: c.ink, border: `1px solid ${c.line}` }}><RefreshCw size={14} /> Restaurar copia<input type="file" accept="application/json" onChange={importBackup} className="hidden" /></label>
          </div>

          <div className="rounded-2xl p-4 flex gap-3" style={{ backgroundColor: c.mintSoft, border: `1px solid ${c.line}` }}><ShieldCheck size={18} style={{ color: c.green }} className="shrink-0 mt-0.5" /><p className="text-xs leading-relaxed" style={{ color: c.inkSoft }}>Tus datos se guardan solo en este dispositivo. Plan informativo; no reemplaza indicación médica. Consultas: tu email de contacto.</p></div>
        </div>
      </div>)}
    </div>
  </div>);
}
