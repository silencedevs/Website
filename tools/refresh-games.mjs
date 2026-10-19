import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const games = JSON.parse(await readFile(`${root}/data/games.json`, 'utf8'));
const output = {};
const json = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${response.status} from ${new URL(url).hostname}`);
  return response.json();
};
await mkdir(`${root}/public/assets/games`, { recursive: true });
for (const game of games) {
  if (!Number.isSafeInteger(game.gameId) || game.gameId < 1) throw new Error('gameId must be a positive safe integer Roblox place ID.');
  const { universeId } = await json(`https://apis.roblox.com/universes/v1/places/${game.gameId}/universe`);
  if (!universeId) throw new Error(`No universe found for place ${game.gameId}. Use the number after /games/ in its Roblox URL.`);
  const details = (await json(`https://games.roblox.com/v1/games?universeIds=${universeId}`)).data?.[0];
  const thumbnails = (await json(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&countPerUniverse=1&defaults=true&size=768x432&format=Png&isCircular=false`)).data?.[0]?.thumbnails;
  const image = thumbnails?.find((item) => item.state === 'Completed');
  const icon = (await json(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`)).data?.find((item) => item.state === 'Completed');
  if (!details?.name || !(image || icon)?.imageUrl) throw new Error(`Roblox metadata or artwork not ready for ${game.gameId}; retry later.`);
  for (const [kind, item] of [['cover', image || icon], ['icon', icon || image]]) {
    const url = new URL(item.imageUrl);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.rbxcdn.com')) throw new Error('Unexpected artwork host.');
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Roblox artwork download failed.');
    await writeFile(`${root}/public/assets/games/${game.gameId}-${kind}.png`, Buffer.from(await response.arrayBuffer()));
  }
  output[game.gameId] = {
    name: details.name,
    universeId,
    creator: details.creator?.name || 'Roblox creator',
    url: `https://www.roblox.com/games/${game.gameId}`,
    image: `assets/games/${game.gameId}-cover.png`,
    icon: `assets/games/${game.gameId}-icon.png`,
    imageSource: (image || icon).imageUrl,
    retrievedAt: new Date().toISOString()
  };
  console.log(`${game.gameId}: ${details.name}`);
}
// Replace metadata only after every configured game resolved successfully.
await writeFile(`${root}/data/roblox-cache.json`, `${JSON.stringify(output, null, 2)}\n`);
