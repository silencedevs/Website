import MarkdownIt from 'markdown-it';

export function renderGameMarkdown(source, base) {
  const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
  const heading = markdown.renderer.rules.heading_open;
  markdown.renderer.rules.heading_open = (tokens, index, options, env, renderer) => {
    const level = Math.min(6, Number(tokens[index].tag.slice(1)) + 1);
    tokens[index].tag = `h${level}`;
    const closing = tokens.slice(index + 1).find(token => token.type === 'heading_close');
    if (closing) closing.tag = `h${level}`;
    return heading ? heading(tokens, index, options, env, renderer) : renderer.renderToken(tokens, index, options);
  };
  const image = markdown.renderer.rules.image;
  markdown.renderer.rules.image = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    const path = token.attrGet('src').replace(/^\//, '');
    if (!/^assets\/[\w/.-]+\.(?:png|jpe?g|webp|gif|svg)$/i.test(path) || path.split('/').includes('..')) throw new Error('Markdown images must use a local assets/ path. Store the file under public/assets/.');
    token.attrSet('src', `${base}${path}`);
    token.attrSet('loading', 'lazy');
    token.attrSet('decoding', 'async');
    return image(tokens, index, options, env, renderer);
  };
  return markdown.render(source);
}
