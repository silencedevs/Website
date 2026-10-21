import { fragmentShader } from './background-shader.js';

const control = document.querySelector('.background-motion-control');
const status = document.querySelector('#background-status');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const touchDevice = (globalThis.navigator?.maxTouchPoints || 0) > 0 || matchMedia('(any-pointer: coarse)').matches;
document.documentElement.dataset.backgroundInput = touchDevice ? 'none' : 'pointer';
let dispose;

function startBackground() {
  dispose?.();
  dispose = undefined;
  document.documentElement.dataset.background = 'loading';
  status.hidden = false;
  status.textContent = 'Starting background';
  const previous = document.querySelector('.site-background-canvas');
  const failures = [];
  for (const version of ['webgl2', 'webgl', 'experimental-webgl']) {
    const canvas = previous.cloneNode();
    previous.replaceWith(canvas);
    const result = mount(canvas, version);
    if (result.cleanup) { dispose = result.cleanup; return; }
    failures.push(`${version}: ${result.error}`);
    canvas.replaceWith(previous);
  }
  const failure = failures.join(' | ');
  document.documentElement.dataset.background = 'unavailable';
  control.hidden = false;
  control.textContent = 'Retry background';
  control.title = failure;
  status.hidden = false;
  status.textContent = `Background unavailable: ${failure}`;
  control.onclick = startBackground;
}

function mount(canvas, version) {
  let gl, vertex, fragment, program, buffer, vao;
  let raf = 0, paused = false, overrideMotion = false, elapsed = 0, previousTime = 0;
  const mouse = { x: .5, y: .5 };
  const cleanupGL = () => {
    cancelAnimationFrame(raf);
    if (!gl) return;
    if (program) gl.deleteProgram(program);
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    if (buffer) gl.deleteBuffer(buffer);
    if (vao) gl.deleteVertexArray(vao);
  };
  try {
    gl = canvas.getContext(version, { antialias: false, alpha: false });
    if (!gl) throw new Error(`${version} is unavailable in this browser.`);
    const legacy = version !== 'webgl2';
    const vertexSource = legacy ? 'attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0.0,1.0);}' : '#version 300 es\nin vec2 a_pos;\nvoid main(){gl_Position=vec4(a_pos,0.0,1.0);}';
    // WebGL 1 uses the same scene mathematics with its equivalent GLSL syntax.
    const source = legacy ? fragmentShader.replace(/^#version 300 es\s*/, '').replace('out vec4 outColor;', '').replace(/\boutColor\b/g, 'gl_FragColor') : fragmentShader;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Shader allocation failed.');
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || 'Shader compilation failed.';
        gl.deleteShader(shader); throw new Error(message);
      }
      return shader;
    };
    vertex = compile(gl.VERTEX_SHADER, vertexSource);
    fragment = compile(gl.FRAGMENT_SHADER, source);
    program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Shader link failed.');
    gl.useProgram(program);
    if (!legacy) { vao = gl.createVertexArray(); gl.bindVertexArray(vao); }
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_pos'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const time = gl.getUniformLocation(program,'u_time'), resolution = gl.getUniformLocation(program,'u_resolution'), pointer = gl.getUniformLocation(program,'u_mouse');
    const reduced = () => preference.matches && !overrideMotion;
    const pointerResponsive = !touchDevice && matchMedia('(hover: hover) and (pointer: fine)').matches;
    const draw = () => {
      gl.uniform1f(time, elapsed); gl.uniform2f(resolution, canvas.width, canvas.height); gl.uniform2f(pointer, mouse.x, mouse.y); gl.drawArrays(gl.TRIANGLES,0,3);
    };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth*dpr)), height = Math.max(1, Math.floor(canvas.clientHeight*dpr));
      if (canvas.width !== width || canvas.height !== height) {canvas.width=width;canvas.height=height;}
      gl.viewport(0,0,width,height); draw();
    };
    const render = now => {
      if (paused || reduced() || document.hidden) return;
      if (previousTime) elapsed += (now-previousTime)/1000;
      previousTime=now; draw(); raf=requestAnimationFrame(render);
    };
    const update = () => {
      cancelAnimationFrame(raf); previousTime=0;
      const state = reduced() ? 'reduced' : paused || document.hidden ? 'paused' : 'running';
      document.documentElement.dataset.background=state;
      control.hidden=false; control.title='';
      status.hidden = true;
      control.textContent=reduced()?'Play background':paused?'Resume background':'Pause background';
      control.setAttribute('aria-pressed',String(paused || reduced()));
      if(state==='running')raf=requestAnimationFrame(render);
    };
    control.onclick=()=>{if(reduced()){overrideMotion=true;paused=false;}else paused=!paused;update();};
    const move = event=>{if(event.pointerType==='touch')return;const rect=canvas.getBoundingClientRect();mouse.x=(event.clientX-rect.left)/rect.width;mouse.y=1-(event.clientY-rect.top)/rect.height;};
    const changePreference=()=>{overrideMotion=false;draw();update();};
    const lost=event=>{event.preventDefault();cancelAnimationFrame(raf);document.documentElement.dataset.background='unavailable';control.textContent='Retry background';control.title='The graphics context was lost.';status.hidden=false;status.textContent='The background graphics context was lost.';control.onclick=startBackground;};
    const observer=new ResizeObserver(resize);observer.observe(canvas);
    if (pointerResponsive) window.addEventListener('pointermove',move,{passive:true});
    document.addEventListener('visibilitychange',update);preference.addEventListener('change',changePreference);canvas.addEventListener('webglcontextlost',lost);
    document.documentElement.dataset.backgroundRenderer=version;
    resize();update();
    return { cleanup(){cleanupGL();observer.disconnect();window.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',update);preference.removeEventListener('change',changePreference);canvas.removeEventListener('webglcontextlost',lost);} };
  } catch(error) { cleanupGL(); return {error:error.message}; }
}
addEventListener('pagehide',()=>dispose?.());
addEventListener('pageshow',event=>{if(event.persisted)startBackground();});
startBackground();
