/*
 * credits.js: who made this, who flew it, and whose work it stands on.
 *
 * Built as a DOM tree so the simulator overlay and the public board can
 * share the same roll. The live address is this page at #credits. The
 * board points there rather than keeping a second copy.
 *
 * WHY A PILOT ROW SAYS NOTHING ABOUT THE PILOT. It carries a name, a
 * slot and a link out, and that is all. Anything written under one of
 * these names is somebody describing a person who is not in the room to
 * be asked, and no line of it is worth as much as the name being spelled
 * right and the link going to the right place.
 *
 * WHY THE CARD IS THE HIT TARGET BUT THE NAME IS THE LINK. A pilot card
 * is one thing about one person, so a click anywhere on it should land
 * on their channel. Wrapping the whole card in an <a> would make the
 * accessible name of that link the whole card rather than the name on
 * it. So the heading holds the anchor and the anchor's ::after is
 * stretched over the card.
 * The project cards below could not be wrapped anyway: their copy
 * already carries links, and an <a> inside an <a> is not a document.
 *
 * Marks live in assets/credits (sim) or credits/ (board). The four
 * project marks are the official ones: Betaflight's dark wordmark,
 * TrackDraw's dark-background colour mark, Grok's 2025 wordmark,
 * Claude's starburst. The faces are the channels' own pictures, at the
 * size YouTube serves them. All of them are used only to name the work.
 *
 * THE PARTNERS (src/partners/roster.js) have a block of their own under the
 * maker, because they back the project rather than having built it, and
 * their marks are the one colour chrome files the roster names, from
 * assets/partners, so the roll adds no colour the palette does not have.
 * Each card links to the partner, tagged (partnerHref) so they see WebFPV
 * in their own numbers, and the Partners row under the roll opens their
 * page on the board.
 *
 * This file is part of WebFPVSimulator.
 *
 * WebFPVSimulator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at
 * your option) any later version.
 *
 * WebFPVSimulator is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WebFPVSimulator. If not, see <https://www.gnu.org/licenses/>.
 */

import { LOGO_DIR, PARTNERS, partnerHref, roleTitle } from '../partners/roster.js';

/*
 * The beta roll. Slot numbers are a start list's: the order they turned
 * up, not a ranking.
 *
 * Jannes has no channel to link. His row carries the same slot and the
 * same weight as the other three, with initials where a face would be,
 * because the roll is a record of who flew it and not a list of who
 * posts about it.
 */
/*
 * THE RACEGOW5 ROOMS AND WHO BUILT THEM.
 *
 * Eight tracks in `scripts/racegow-lattice.js`, read off the official
 * animations and brought over by one person. Six other people designed
 * them, and a pilot flying one should be able to find out who. The names
 * here are the `credit.designer` fields of the shipped presets and
 * `scripts/micro-check.js` fails if this list and those presets disagree,
 * so it cannot go stale when a ninth arrives.
 */
const RACEGOW = [
  { designer: 'AyyyKayyy', tracks: ['Track 8'] },
  { designer: 'Cumber and Hotspur', tracks: ['Track 5'] },
  { designer: 'Skittles', tracks: ['Track 1', 'Track 2'] },
  { designer: 'the Lego Dans', tracks: ['Track 3', 'Track 4'] },
  { designer: 'MrE', tracks: ['Track 6'] },
  { designer: 'FPVBean', tracks: ['Track 7'] },
];

export const RACEGOW_CREDITS = RACEGOW;

const PILOTS = [
  {
    slot: '01',
    name: 'Asylum',
    face: 'asylum.jpg',
    channel: 'https://www.youtube.com/@AsylumFpv',
    handle: 'youtube.com/@AsylumFpv',
  },
  {
    slot: '02',
    name: 'Jannes',
    face: null,
    channel: null,
    handle: null,
  },
  {
    slot: '03',
    name: 'LeStar',
    face: 'lestar.jpg',
    channel: 'https://www.youtube.com/@lestarfpv',
    handle: 'youtube.com/@lestarfpv',
  },
  {
    slot: '04',
    name: 'CrapShack',
    face: 'crapshack.jpg',
    channel: 'https://www.youtube.com/@Z_CrapShack',
    handle: 'youtube.com/@Z_CrapShack',
  },
];

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) {
    n.className = cls;
  }
  if (text != null) {
    n.textContent = text;
  }
  return n;
}

function link(href, text) {
  const a = el('a', null, text);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

/*
 * A project's official mark. A <span> and not a <div> because the mark
 * is the card's heading now, and a div inside an <h4> is not a document.
 *
 * A mark that spells the name is the label, so it takes role=img and the
 * name. A mark that sits beside the name in type is decorative, and
 * labelling it as well would have the card announce itself twice.
 */
function logo(src, alt, well, decorative) {
  const box = el('span', well === 'light' ? 'credit-logo light' : 'credit-logo');
  if (decorative) {
    box.setAttribute('aria-hidden', 'true');
  } else {
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', alt);
  }
  /*
   * Inline the SVG instead of <img src>. The local static server has no
   * MIME table for images unless it is restarted, and Chrome will not
   * paint an SVG <img> served as application/octet-stream. fetch() still
   * reads the bytes, and an inline <svg> does not care about the type.
   */
  fetch(src)
    .then((r) => {
      if (!r.ok) {
        throw new Error(String(r.status));
      }
      return r.text();
    })
    .then((text) => {
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      const svg = doc.documentElement;
      if (!svg || svg.tagName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
        throw new Error('bad svg');
      }
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('aria-hidden', 'true');
      box.append(svg);
    })
    .catch(() => {
      box.append(el('span', 'credit-logo-fallback', alt));
    });
  return box;
}

function initials(name) {
  const parts = name.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s+/);
  const letters = parts.length > 1
    ? parts.map((p) => p[0]).join('').slice(0, 2)
    : name.slice(0, 2);
  return letters.toUpperCase();
}

/*
 * A channel picture in a square plate. The name is already the heading
 * beside it, so the plate is decorative and stays out of the accessible
 * tree: a screen reader that reads the picture as well would announce
 * every pilot twice. A picture that fails to load falls back to the
 * initials plate, which is also what Jannes gets, so a missing file
 * never leaves a hole where a person should be.
 */
function face(src, name) {
  const box = el('span', 'credit-face');
  box.setAttribute('aria-hidden', 'true');
  if (!src) {
    box.classList.add('is-blank');
    box.append(el('span', 'credit-face-mark', initials(name)));
    return box;
  }
  const img = new Image(240, 240);
  img.src = src;
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => {
    img.remove();
    box.classList.add('is-blank');
    box.append(el('span', 'credit-face-mark', initials(name)));
  });
  box.append(img);
  return box;
}

/* The small mono line that says where the link goes. The play triangle
   in front of it is drawn in CSS, so nothing here borrows a trademark to
   say the word video. */
function handleLine(text) {
  return el('span', 'credit-handle', text);
}

/*
 * A project card: the mark across the top, and copy under it.
 *
 * THE MARK IS THE HEADING. Betaflight's wordmark says Betaflight, so a
 * card that showed the wordmark and then wrote the name underneath said
 * it twice, which is what the roll used to do. The mark carries the
 * link and `alt` carries the accessible name, so a screen reader still
 * hears one title and a broken fetch still shows one, in the fallback.
 *
 * `wordmark: false` is for a mark that is a symbol rather than a name.
 * Claude's starburst is a lovely thing and it does not spell anything,
 * so that card gets the symbol and the word beside it. Three lines of
 * flag beats a heading that only some readers can read.
 *
 * WHY THIS CARD IS NOT A LINK THE WAY A PERSON CARD IS. Its copy
 * already carries two or three links of its own, and a hit target
 * stretched over the card would swallow every one of them.
 */
function projectCard({ src, alt, well, title, href, body, wordmark = true }) {
  const n = el('article', 'credit project');
  const h = el('h4', 'credit-title');
  const parts = [logo(src, alt || title, well, !wordmark)];
  if (!wordmark) {
    parts.push(el('span', 'credit-title-text', title));
  }
  if (href) {
    const a = link(href, null);
    a.append(...parts);
    h.append(a);
  } else {
    h.append(...parts);
  }
  n.append(h);
  const copy = el('div', 'credit-copy');
  if (typeof body === 'string') {
    copy.append(el('p', null, body));
  } else if (body) {
    copy.append(body);
  }
  n.append(copy);
  return n;
}

/*
 * A person card: face and slot number down the left, name and link down
 * the right, and the whole card is the hit target when there is a
 * channel to open. `nameNode` lets the maker keep the andAgainFPV
 * wordmark as its own heading instead of plain text, and `note` is the
 * maker's line about what was built. A pilot row passes neither.
 */
function personCard({ cls, src, slot, name, nameNode, note, channel, handle }) {
  const n = el('article', cls ? `credit person ${cls}` : 'credit person');
  const stack = el('div', 'credit-stack');
  stack.append(face(src, name));
  if (slot) {
    const num = el('span', 'credit-slot', slot);
    num.setAttribute('aria-hidden', 'true');
    stack.append(num);
  }
  n.append(stack);

  const copy = el('div', 'credit-copy');
  const h = el('h4', null, null);
  const label = nameNode || document.createTextNode(name);
  if (channel) {
    const a = link(channel, null);
    a.append(label);
    h.append(a);
    n.classList.add('is-link');
  } else {
    h.append(label);
  }
  copy.append(h);
  if (note) {
    copy.append(el('p', null, note));
  }
  if (handle) {
    copy.append(handleLine(handle));
  }
  n.append(copy);
  return n;
}

/*
 * A partner's card: their one colour mark as the heading, linked to their
 * own site, the role in words over what they do. The mark goes through
 * logo() when it is a vector, like every other mark here, and is an <img>
 * when it is a picture, which the local server's MIME table serves.
 */
function partnerCard(p) {
  const n = el('article', 'credit project partner');
  const h = el('h4', 'credit-title');
  const file = p.logo.mono;
  const src = new URL(`${LOGO_DIR}/${file}`, document.baseURI).href;
  let mark;
  if (/\.svg$/i.test(file)) {
    mark = logo(src, p.name, null, false);
  } else {
    mark = el('span', 'credit-logo');
    const img = el('img');
    img.src = src;
    img.alt = p.name;
    mark.append(img);
  }
  const first = p.links[0];
  if (first) {
    const a = link(partnerHref(first.href, 'sim_credits'), null);
    a.append(mark);
    h.append(a);
  } else {
    h.append(mark);
  }
  n.append(h);
  const copy = el('div', 'credit-copy');
  copy.append(el('p', 'credit-role', roleTitle(p)), el('p', null, p.about));
  n.append(copy);
  return n;
}

function section(kicker, heading) {
  const n = el('section', 'credit-block');
  const k = el('div', 'credit-kicker');
  k.append(el('span', null, kicker));
  n.append(k);
  if (heading) {
    n.append(el('h3', null, heading));
  }
  return n;
}

/**
 * Fill `host` with the credits roll. assetBase is the directory that
 * holds the marks and the faces, with no trailing slash.
 */
export function fillCredits(host, { assetBase = 'assets/credits' } = {}) {
  const src = (name) => new URL(`${assetBase}/${name}`, document.baseURI).href;
  host.textContent = '';

  const lede = el('p', 'credits-lede', '一款浏览器 FPV 竞速模拟器。飞控采用 Betaflight，赛道设计灵感来自 Track Draw，其余部分由一位飞手和反复试飞的伙伴共同完成。');
  host.append(lede);

  const made = section('开发者', '');
  const makerMark = el('span', 'maker-mark');
  makerMark.append(document.createTextNode('andAgain'), el('span', 'fpv', 'FPV'));
  made.append(personCard({
    cls: 'maker',
    src: src('andagain.jpg'),
    name: 'andAgainFPV',
    nameNode: makerMark,
    note: '开发了这款模拟器、赛道编辑器和公开排行榜，并与 Grok 和 Claude 合作完成项目。',
    channel: 'https://www.youtube.com/@andAgainFPV',
    handle: 'youtube.com/@andAgainFPV',
  }));
  host.append(made);

  const partners = section('合作伙伴', '感谢他们对 WebFPV 的支持。');
  const partnerRow = el('div', 'credit-row partners');
  for (const p of PARTNERS) {
    partnerRow.append(partnerCard(p));
  }
  partners.append(partnerRow);
  host.append(partners);

  const pilots = section('内测飞手', '他们反复试飞，直到手感接近真实四轴。');
  const row = el('div', 'credit-row pilots');
  for (const p of PILOTS) {
    row.append(personCard({
      cls: 'pilot',
      src: p.face ? src(p.face) : null,
      slot: p.slot,
      name: p.name,
      channel: p.channel,
      handle: p.handle,
    }));
  }
  pilots.append(row);
  host.append(pilots);

  const controller = section('飞控', '');
  const bfBody = el('p');
  bfBody.append(
    document.createTextNode('速率、PID 控制环、滤波器、前馈、TPA、I 项松弛、空中模式和抗重力均直接编译到此页面中，并非重新实现。'),
    link('https://github.com/betaflight/betaflight', 'Betaflight'),
    document.createTextNode(' 采用 GPLv3 许可证，因此本项目也采用该许可证。飞控配置页面致敬了 '),
    link('https://github.com/betaflight/betaflight-configurator', 'Betaflight Configurator'),
    document.createTextNode(' 10.10：沿用了标签页名称、4.5.1 参数以及经典的深灰与橙色风格，但它并不是该应用。没有使用 Vue、MSP 或 iframe。谨向 Betaflight 开发者致谢。'),
  );
  controller.append(projectCard({
    src: src('betaflight.svg'),
    alt: 'Betaflight',
    title: 'Betaflight',
    href: 'https://betaflight.com',
    body: bfBody,
  }));
  host.append(controller);

  const tracks = section('赛道设计工具', '');
  const tdBody = el('p');
  tdBody.append(
    document.createTextNode('赛道编辑器的设计灵感来自 '),
    link('https://trackdraw.app/', 'Track Draw'),
    document.createTextNode('，由荷兰团队 '),
    link('https://dutchdronesquad.nl/', 'Dutch Drone Squad'),
    document.createTextNode(' 制作。按真实场地比例构建障碍，并提供可交付团队使用的赛道平面图。'),
  );
  tracks.append(projectCard({
    src: src('trackdraw.svg'),
    alt: 'TrackDraw',
    title: 'Track Draw',
    href: 'https://trackdraw.app/',
    body: tdBody,
  }));
  host.append(tracks);

  /*
   * The rooms themselves, by name, under the person who built each one.
   * A track is somebody's afternoon with a pipe cutter; the reconstruction
   * is not the design.
   */
  const rooms = section('RaceGOW5 场地', '根据官方动画重建的八条赛道，出自六位设计者。');
  const roomList = el('div', 'credit-rooms');
  for (const r of RACEGOW) {
    const line = el('p', 'credit-room');
    line.append(el('b', null, r.designer));
    line.append(document.createTextNode(` \u00b7 ${r.tracks.join(', ')}`));
    roomList.append(line);
  }
  const roomNote = el('p', 'credit-room-note');
  roomNote.append(document.createTextNode('系列与动画由 '));
  roomNote.append(link('https://racegow.com/tracks', 'RaceGOW'));
  roomNote.append(document.createTextNode(' 制作，并由 andAgainFPV 搬入本模拟器。'));
  roomList.append(roomNote);
  rooms.append(roomList);
  host.append(rooms);

  const horde = section('协作工具', '与 Grok 一起撰写，与 Claude 一起构建。');
  const ai = el('div', 'credit-row pair');
  const grokBody = el('p');
  grokBody.append(
    document.createTextNode('xAI 的 Grok。参与了大量文案、讨论，以及对飞行手感的反复打磨。'),
  );
  const claudeBody = el('p');
  claudeBody.append(
    document.createTextNode('Anthropic 的 Claude。协作工具的另一半，摇杆始终由同一位飞手操控。'),
  );
  ai.append(
    projectCard({
      src: src('grok.svg'),
      alt: 'Grok',
      well: 'light',
      title: 'Grok',
      href: 'https://grok.com',
      body: grokBody,
    }),
    projectCard({
      src: src('claude.svg'),
      alt: 'Claude',
      title: 'Claude',
      wordmark: false,
      href: 'https://claude.ai',
      body: claudeBody,
    }),
  );
  horde.append(ai);
  host.append(horde);

  const legal = el('p', 'credits-legal');
  legal.append(
    document.createTextNode('Betaflight、Track Draw、Grok、Claude、Dutch Drone Squad 及其标识均归各自所有者所有。频道图片归相应飞手所有。此处展示用于致谢，并不表示他们为本页面背书。合作伙伴标识归合作伙伴所有，并经其同意展示。WebFPV 是基于 '),
    link('https://www.gnu.org/licenses/gpl-3.0.html', 'GPLv3'),
    document.createTextNode(' 许可协议发布的自由软件。'),
  );
  host.append(legal);
}
