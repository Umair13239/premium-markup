// Hero centrepiece: the "R" mark as real refractive glass (three.js transmission),
// in the exact brand violet. Loaded lazily; returns a cleanup.
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PM_ICON_PATH } from "@/components/brand/logo";

export function initGlassR(sec: HTMLElement, cv: HTMLCanvasElement) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let R: THREE.WebGLRenderer;
  try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); } catch { sec.classList.add("nogl"); return () => {}; }
  R.setPixelRatio(Math.min(devicePixelRatio, 1.25)); R.toneMapping = THREE.NeutralToneMapping; R.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, .1, 100); cam.position.z = 14;
  const pm = new THREE.PMREMGenerator(R), env = pm.fromScene(new RoomEnvironment(), .04).texture;
  scene.environment = env; scene.background = new THREE.Color("#ffffff");
  const key = new THREE.DirectionalLight("#fff", 2.2); key.position.set(-4, 6, 8); scene.add(key);

  const bc = document.createElement("canvas"), bx = bc.getContext("2d")!;
  let tex: THREE.CanvasTexture | null = null;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ toneMapped: false })); back.position.z = -4; scene.add(back);

  const shapes = SVGLoader.createShapes(new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${PM_ICON_PATH}"/></svg>`).paths[0]);
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 40, bevelEnabled: true, bevelThickness: 8, bevelSize: 4.5, bevelSegments: 3, curveSegments: 8 });
  geo.center(); geo.rotateX(Math.PI); geo.scale(.0165, .0165, .0165); geo.computeVertexNormals();
  // Faces = the exact brand violet (unlit, so it matches the 2D logo and text); sides/bevel = palette #5233B7, glossy, for depth.
  const face = new THREE.MeshBasicMaterial({ color: "#683CE7", toneMapped: false });
  const side = new THREE.MeshPhysicalMaterial({ color: "#5233B7", roughness: .22, metalness: 0, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.2 });
  const g = new THREE.Group(); g.add(new THREE.Mesh(geo, [face, side])); scene.add(g);

  let base = { x: 0, y: 0, s: 1 };
  const layout = () => {
    const w = sec.clientWidth, h = sec.clientHeight, a = w / h; R.setSize(w, h, false); cam.aspect = a; cam.updateProjectionMatrix();
    const vh0 = 2 * 14 * Math.tan(THREE.MathUtils.degToRad(16)), vw0 = vh0 * a, desk = w > 900;
    base = desk ? { x: vw0 * .2, y: 0, s: 1 } : { x: 0, y: vh0 * .2, s: Math.min(1, vw0 / 6.5) };
    const bh = 2 * 18 * Math.tan(THREE.MathUtils.degToRad(16)); back.scale.set(bh * a, bh, 1);
    const k = Math.min(2, devicePixelRatio), W = (bc.width = Math.round(w * k)), H = (bc.height = Math.round(h * k));
    bx.fillStyle = "#ffffff"; bx.fillRect(0, 0, W, H);
    tex?.dispose(); tex = new THREE.CanvasTexture(bc); tex.colorSpace = THREE.SRGBColorSpace;
    (back.material as THREE.MeshBasicMaterial).map = tex; (back.material as THREE.MeshBasicMaterial).needsUpdate = true;
  };
  let tx = 0, ty = 0, mx = 0, my = 0, alive = true;
  const onMove = (e: PointerEvent) => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; };
  addEventListener("pointermove", onMove, { passive: true }); addEventListener("resize", layout);
  document.fonts.ready.finally(() => alive && layout());
  layout();
  const tick = (t: number) => {
    if (!alive) return; requestAnimationFrame(tick);
    const r = sec.getBoundingClientRect(); if (r.bottom < 0) return;
    const sp = Math.max(0, Math.min(1, -r.top / r.height)), T = reduce ? 0 : t / 1000;
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    g.rotation.y = Math.sin(T * .4) * .4 + mx * .7 + sp * Math.PI * .9;
    g.rotation.x = Math.sin(T * .5) * .06 + my * .4 + sp * .4;
    g.position.set(base.x, base.y + Math.sin(T * .8) * .08 + sp * 2.4, 0); g.scale.setScalar(base.s);
    R.render(scene, cam); sec.classList.add("ready");
  };
  requestAnimationFrame(tick);
  return () => {
    alive = false; removeEventListener("pointermove", onMove); removeEventListener("resize", layout);
    geo.dispose(); face.dispose(); side.dispose(); tex?.dispose(); env.dispose(); pm.dispose(); R.dispose();
  };
}
