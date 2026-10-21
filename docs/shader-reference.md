# Background reference

The fragment shader is copied from the operator supplied VincentHosting HeroBackdrop. A direct comparison confirms one changed line only: the original green output channel is written into red, with green and blue output set to zero. Geometry, octahedron/prism distances, satellites, ray marching, distortion, refraction, lighting, camera, mouse response and timing are untouched.

Original fragment SHA256: `3db9a8d51c832f4b35529638d7d2bffcde2df4015c9f8b1a47329a7ac75b0f70`

The original ShaderCanvas renderer is translated from its React effect to a native module with the same WebGL2 context options, DPR cap of 2, resize handling, fullscreen triangle and requestAnimationFrame loop. Pause/play controls and page lifecycle cleanup are wrappers; there is no resolution cap, artificial frame limit, poster substitution or alternate geometry. WebGL 2 is preferred. If context creation or shader compilation fails, WebGL 1 is tried with equivalent GLSL syntax and the exact same fragment scene mathematics. The renderer now surfaces failure through Retry background and its diagnostic title instead of silently hiding the control. Reduced motion initially renders one frame and provides a Play background control.

Touch devices use the neutral mouse uniform `(0.5, 0.5)` with no pointer listener, even if an attached mouse supplies hover/fine-pointer capability. Their fixed backdrop uses a stable large-viewport height and a compositor layer so toolbar changes do not stretch or recenter the scene. The existing page zoom is accounted for in its CSS height; render density and fragment geometry are unchanged. Non-touch desktops retain mouse interaction. Genuine canvas size changes still resize the buffer.
