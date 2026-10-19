let render;
export function configureActions(renderer) { render = renderer; }
export function action(label, href) { return render({label, href}); }
