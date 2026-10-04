/*
 * stickhelp.js: what the Stick help screen says, and where a stick that
 * does nothing is being lost.
 *
 * WHY THIS EXISTS. The owner, 28 September 2026: the board kept getting
 * tickets saying a controller could not yaw, or pitch, or throttle, and
 * nothing in any of them could say whether the pilot's radio was set up
 * wrong or the sim was. Read against the reports' own context, the answer
 * was mostly neither:
 *
 *   phones      nine tickets, every one about yaw or throttle. Chrome on
 *               Android hands a page four axes from a radio it does not
 *               recognise and drops the rest, and a radio in AETR order
 *               puts throttle and yaw on the two axes that compete for one
 *               of the four. No calibration anywhere can bring a dropped
 *               axis back. See fourAxisPad in src/input/input.js.
 *   Firefox     both Linux tickets. It calls an EdgeTX radio a gamepad and
 *               moves its axes. See firefoxRadio in src/input/input.js.
 *   desktops    mostly a radio flown on the built in guess of the channel
 *               order, which the wizard fixes in a minute.
 *   Safari      a radio never seen at all. Every WebKit ticket on the board
 *               reads the keyboard and 0 Hz, and the pilots who had a radio
 *               plugged in were told to swap cables. See radioBlind.
 *
 * So the screen does not start with instructions. It starts with the one
 * question that splits every cause into two piles, asked while the pilot's
 * hand is on the stick: move the stick that is not working, does any bar
 * move? If one does, the browser has it and the sim is reading it wrong,
 * and the wizard fixes that. If none does, the stick never reached the
 * browser, nothing in any page can fix it, and what can is the radio, the
 * operating system or the browser, which is what the block under the bars
 * says for the platform the pilot is on.
 *
 * Plain functions of plain data, so scripts/input-selftest.js can read every
 * sentence without a browser. The DOM is src/ui/ui.js's; the axes are
 * input.js's stickCheckView.
 *
 * This file is part of WebFPVSimulator.
 *
 * WebFPVSimulator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at
 * your option) any later version.
 *
 * WebFPVSimulator is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY, without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WebFPVSimulator. If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * WHICH MACHINE THE PILOT IS HOLDING, as far as the advice cares.
 *
 * `env` is what the browser says about itself: userAgent, the User-Agent
 * Client Hints platform where there is one, maxTouchPoints, and whether the
 * primary pointer is coarse. Passed in rather than read here, so a test can
 * be any machine.
 *
 * THE PHONE THAT SAYS IT IS A LINUX DESKTOP. Chrome on Android asked for the
 * desktop site sends "X11; Linux x86_64", and four of the nine phone tickets
 * came that way; only their GPUs, Adreno and Mali, gave them away. A coarse
 * primary pointer is the tell available here: a Linux laptop with a touch
 * screen still points with its touchpad, a phone points with a finger.
 */
export function stickPlatform(env = {}) {
  const ua = String(env.userAgent || '');
  const p = String(env.uaPlatform || '');
  const touch = Number(env.maxTouchPoints) || 0;
  if (/android/i.test(p) || /Android/.test(ua)) {
    return 'android';
  }
  /* iPadOS asks for the desktop site by default and says Macintosh, with
   * touch points no Mac has. */
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touch > 1)) {
    return 'ios';
  }
  if (/windows/i.test(p) || /Windows/.test(ua)) {
    return 'windows';
  }
  if (/chrome ?os/i.test(p) || /CrOS/.test(ua)) {
    return 'chromeos';
  }
  if (/mac/i.test(p) || /Macintosh|Mac OS X/.test(ua)) {
    return 'mac';
  }
  if (/linux/i.test(p) || /Linux/.test(ua)) {
    return env.coarse ? 'android' : 'linux';
  }
  return 'other';
}

/* Which browser, for the two whose own behaviour the advice names. */
export function stickBrowser(userAgent = '') {
  const ua = String(userAgent);
  if (/Firefox\//.test(ua)) {
    return 'firefox';
  }
  if (/Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua)) {
    return 'safari';
  }
  return 'chromium';
}

/*
 * A BROWSER THAT DOES NOT SHOW A RADIO TO A PAGE, and what to say when the
 * pilot has come here to fly with one.
 *
 * bug-616cc604, 29 September, Safari 27: a Radiomaster Pocket that neither a
 * MacBook Air nor an iPad showed to the sim, and "I've tried several USB-C to
 * USB-C cables and even my USB-C hub to a USB-A to USB-C cable". Everything
 * the sim said had sent them to do exactly that. "No radio or gamepad found.
 * Plug one in, set it to joystick mode" is right for a radio in the wrong
 * mode, and on Safari it sent a pilot off to swap cables that could not
 * matter. The title and the pause menu said nothing at all, because their
 * trouble rows only exist once a pad has reached the sim.
 *
 * WHAT IS KNOWN. Of the 200 tickets on the board that day, eight came from
 * WebKit: four Safari on a Mac and four on an iPhone or iPad, where every
 * browser is WebKit underneath. All eight read `source` the keyboard and
 * `padHz` 0. Three of the Mac ones were about a radio (bug-c3ecb273,
 * bug-7d3064fc, bug-616cc604, on Safari 26.5, 26.6.2 and 27.0) and so was
 * the iPad's bug-40980a75, and not one of the four was ever shown a pad. The
 * same board holds 22 tickets from Chrome and Firefox on Macs that flew a
 * pad or a radio. That evidence is one sided, since a pilot whose radio works
 * has no reason to file a ticket, but the flight feel tickets come from
 * exactly those pilots and none of them is a Safari radio.
 *
 * WHAT IS NOT. Why. On an iPhone or iPad the GameController framework is the
 * only source of pads and it lists the controllers Apple knows, which a USB
 * radio is not. On a Mac WebKit has a generic HID reader beside that one, so
 * "Safari only shows controllers it knows" is NOT a reason this file can give
 * for a Mac, and it does not. Nobody on this project has had a radio in
 * Safari to try. So the Mac words say what has been seen ("usually cannot")
 * and ask for the one test that settles it for the pilot in front of the
 * screen: the same radio, plugged in the same way, in Chrome, Edge or
 * Firefox. A report now carries what the browser listed (browserPads in
 * src/input/input.js), so the next Safari ticket says whether it listed
 * anything at all.
 *
 * One entry per surface, because the surfaces have different room: the
 * banner over a flight, the help column beside a menu row, a row of the
 * How to fly screen, the sentence under Stick help's bars, and its block for
 * when no bar moves. Null for every other browser, whose surfaces keep their
 * own words.
 */
const RADIO_TEST = '请先将遥控器切换到摇杆模式并连接，然后试试 Chrome、Edge 或 Firefox。'
  + '如果在那里能识别，问题就在 Safari。';

const RADIO_BLIND = {
  safari: {
    banner: 'Safari 通常无法识别 USB 遥控器，请改用 Chrome、Edge 或 Firefox。',
    note: 'Safari 通常无法识别 USB 遥控器，更换线缆、接口或遥控器设置也无济于事。'
      + '请在遥控器处于摇杆模式时，用 Chrome、Edge 或 Firefox 打开此页面。',
    howto: 'Safari 通常无法识别 USB 遥控器。请先用 Chrome、Edge 或 Firefox 打开此页面，'
      + '并在加载页面前将遥控器设为摇杆模式，然后到“设置”中校准摇杆。',
    say: 'Safari 没有向此页面提供遥控器或游戏手柄。它通常无法识别 USB 遥控器，'
      + '更换线缆、接口或遥控器设置也无济于事。请改用 Chrome、Edge 或 Firefox。'
      + '游戏手柄在有输入时才会显示。',
    lines: [
      'Safari 通常不会向网页提供 USB 遥控器，因此更换线缆、接口或集线器可能无济于事。'
        + RADIO_TEST,
    ],
  },
  ios: {
    banner: 'iPhone 或 iPad 通常无法识别 USB 遥控器，请使用电脑。',
    note: 'iPhone 或 iPad 上的所有浏览器底层都是 Safari，只能识别 Apple 支持的游戏手柄。'
      + 'USB 遥控器通常不在其中，更换线缆、转接头或遥控器设置也无法解决。请使用装有 Chrome、Edge 或 Firefox 的电脑。',
    howto: 'iPhone 或 iPad 上的浏览器通常都无法识别 USB 遥控器。请使用装有 Chrome、Edge 或 Firefox 的电脑，'
      + '在加载页面前将遥控器设为摇杆模式，然后到“设置”中校准摇杆。',
    say: '此 iPhone 或 iPad 没有向页面提供遥控器或游戏手柄。这里的浏览器只能识别 Apple 支持的游戏手柄，'
      + '而 USB 遥控器通常不在其中。请使用装有 Chrome、Edge 或 Firefox 的电脑。',
    lines: [
      'iPhone 或 iPad 上的浏览器底层都是 Safari，只能识别它支持的游戏手柄。USB 遥控器通常不在其中，'
        + '更换线缆、转接头或遥控器设置也无法解决。',
      '使用装有 Chrome、Edge 或 Firefox 的电脑连接遥控器最可靠。安卓手机也可能识别遥控器，'
        + '但 Chrome 可能会丢弃其中一些通道。',
    ],
  },
};

export function radioBlind(platform, browser) {
  if (platform === 'ios') {
    return RADIO_BLIND.ios;
  }
  if (platform === 'mac' && browser === 'safari') {
    return RADIO_BLIND.safari;
  }
  return null;
}

/*
 * THE BANNER FOR A RADIO THAT IS NOT THERE, for the pilot who asked for one:
 * Choose joystick, Calibrate sticks, Check sticks, the restart switch. Two
 * lines, the way lostStickNotice is. `then` is what the ordinary advice ends
 * on: move the stick so the browser shows the pad, or reload after plugging
 * it in.
 */
export function noRadioNotice(platform, browser, then = 'move') {
  const blind = radioBlind(platform, browser);
  if (blind) {
    return `未检测到遥控器或游戏手柄。\n${blind.banner}`;
  }
  return then === 'reload'
    ? '未检测到遥控器或游戏手柄。\n请连接设备、切换到摇杆模式，然后重新加载页面。'
    : '未检测到遥控器或游戏手柄。\n请连接设备、切换到摇杆模式，然后拨动摇杆。';
}

export function capital(word) {
  const w = String(word || '');
  return w ? w[0].toUpperCase() + w.slice(1) : w;
}

/* "yaw", "yaw and throttle", "roll, pitch and yaw". */
export function channelList(channels) {
  const names = { throttle: '油门', roll: '横滚', pitch: '俯仰', yaw: '偏航' };
  const c = (channels || []).map((name) => names[name] || name);
  if (c.length <= 1) {
    return c[0] || '';
  }
  const last = c.pop();
  return `${c.join('、')}和${last}`;
}

/*
 * THE LINE A FLYING PILOT SEES, once per channel per page, in the banner:
 * short, because it is read over a moving picture, and it names the one
 * thing to do, because the pilot has both hands on a radio. See main.js,
 * noteLostSticks.
 */
export function lostStickNotice(channel) {
  const name = ({ throttle: '油门', roll: '横滚', pitch: '俯仰', yaw: '偏航' })[channel] || channel;
  return `${name}通道没有输入。\n请暂停并查看“摇杆帮助”。`;
}

/*
 * THE LIVE SENTENCE UNDER THE BARS: what the pilot's hand just did, read
 * for them. First match wins, and the order is the order of certainty: a
 * missing axis is a fact about the map, a stick moving that nothing reads
 * is a fact about this second, and everything after that is waiting for
 * the pilot to try.
 */
export function stickSay(view, platform = 'other', browser = '') {
  const v = view || {};
  if (!v.pad) {
    /* Where nothing a pilot does with a stick or a cable can matter, saying
     * "move a stick" is the wrong answer: see radioBlind. */
    const blind = radioBlind(platform, browser);
    if (blind) {
      return blind.say;
    }
    return '浏览器尚未收到遥控器或游戏手柄的输入。请连接设备、切换到摇杆模式并拨动摇杆。'
      + '浏览器只有在设备产生输入后才会向页面显示它。';
  }
  const missing = v.missing || [];
  if (missing.length) {
    return `已保存的校准将${channelList(missing)}映射到了此设备不存在的通道，因此没有输入。`
      + `此设备有 ${v.axisCount} 个通道。重新校准摇杆即可按实际输入重新映射。`;
  }
  const m = v.moving;
  if (m && !m.channel) {
    const stick = (v.strays || []).includes(m.axis);
    return stick
      ? `通道 ${m.axis} 正在随摇杆移动，但模拟器没有读取它。浏览器收到了摇杆输入，`
        + '只是模拟器将它映射到了错误通道。重新校准摇杆，约一分钟即可修正。'
      : `通道 ${m.axis} 正在移动，但模拟器没有读取它。如果这就是失灵的摇杆，`
        + '重新校准摇杆即可将它映射到正确通道。';
  }
  if (m && m.channel) {
    const name = ({ throttle: '油门', roll: '横滚', pitch: '俯仰', yaw: '偏航' })[m.channel] || m.channel;
    return `这是${name}，对应通道 ${m.axis}，输入已到达模拟器。`;
  }
  const strays = v.strays || [];
  if (strays.length) {
    const which = strays.length > 1 ? `通道 ${channelList(strays.map(String))}` : `通道 ${strays[0]}`;
    return `${which}随摇杆移动，但模拟器没有读取。`
      + '这说明摇杆映射到了错误通道，重新校准即可修正。';
  }
  const dead = v.dead || [];
  if (dead.length) {
    const where = platform === 'android' && v.fourAxes
      ? '此手机只传递遥控器的四个通道；如果没有指示条移动，可能是 Chrome 丢弃了输入。'
      : '';
    return `${channelList(dead)}通道在飞行中没有移动。现在拨动${dead.length > 1 ? '这些摇杆' : '这个摇杆'}`
      + `并观察指示条。${where}`;
  }
  return '将失灵的摇杆分别推到两个端点，并观察指示条。';
}

/*
 * THE RADIO'S HALF, which is the same on every machine: the mode it is in
 * and the model it is on. A model decides what each channel sends, and a
 * new or empty one can send nothing on a stick, which from here looks
 * exactly like a stick that is not there.
 */
const RADIO_LINE = '在遥控器上：连接时选择 USB 摇杆模式，并在打开此页面前检查当前模型。'
  + '模型决定各通道发送的信号；新建或空白模型可能不会发送摇杆输入。';

/*
 * IF NO BAR MOVES, for the machine the pilot is on. Each is what can
 * actually be done there, in the order a pilot should try it, and says
 * plainly where this page can do nothing.
 *
 * THE ANDROID PARAGRAPHS ARE WORKED OUT FROM BOTH ENDS' CODE, NOT TRIED.
 *
 * Chrome's fallback for a pad it does not know (GamepadMappings.java,
 * UnknownGamepadMappings, the legacy branch: "only the canonical axes are
 * exposed ... and unmatched input axes are dropped") keeps X and Y, one of Z
 * and Rx, and one of Ry and Rz. EdgeTX in its ordinary joystick mode sends
 * channels 1 to 8 on X, Y, Z, Rx, Ry, Rz, Slider and Dial, in that order
 * (usb_driver.cpp fills axis i from channel i + 1), and OpenTX, which EdgeTX
 * came from, does the same. So a phone gets channels 1 and 2, one of 3 and
 * 4, and one of 5 and 6, and on an AETR radio that is one of throttle and yaw
 * gone. Five tickets on 29 and 30 September, five radios from three makers
 * (bug-8acd3b2f, bug-abaabdde, bug-b2de5239, bug-da8c8d0e, bug-f42ae325), all
 * arrived as 4 axes and 17 buttons with axis 2 resting at the throttle's end:
 * Z kept, Rx and yaw dropped.
 *
 * The fix this used to give was a computer, or EdgeTX's Advanced mode with
 * the four sticks on X, Y, Z and rotZ. That is right, and it is no help on
 * OpenTX, which has no such mode. Mixing the missing stick onto channels 5
 * AND 6 works on both, in the joystick mode they are already in: Chrome keeps
 * one of the two, so the stick arrives on it whichever that is, and on a
 * radio that lost yaw the four axes are then roll, pitch, throttle and yaw,
 * the order this page guesses. Nobody has flown it on a phone yet, so the
 * copy says so and asks to be told. A copy of the model, because channel 5
 * is often the arm switch on the model that flies a real quad. And CLEAR the
 * two channels rather than add to them: a line added under an arm switch's
 * line sums with it by default, and the stick would arrive offset by the
 * switch and clipped at one end.
 *
 * Chrome has a newer mapping behind a flag (ANDROID_UNKNOWN_GAMEPAD_EXTRA_
 * AXES) that keeps the rest as extra axes. Under it a radio arrives with
 * more than four axes, fourAxisPad is false, and none of this is shown.
 */
export function platformHelp(platform, browser = 'chromium', facts = {}) {
  const four = facts.fourAxes ? ` Your radio is arriving as ${facts.axisCount || 4} axes.` : '';
  if (platform === 'android') {
    return {
      title: '指示条不动？安卓',
      lines: [
        'Chrome 安卓版只传递遥控器的四个通道，其余通道会被丢弃；四个摇杆中的一个可能因此失灵，'
          + ' 1 and 2, one of channels 3 and 4, and one of channels 5 and 6. Most radios send throttle'
          + ' on 3 and yaw on 4, so one of those two never arrives, most often yaw. Nothing in this'
          + `最常见的是油门或偏航。发生这种情况时，此页面无法恢复该输入，重新校准也无效。${four}`,
        '最可靠的办法是使用能读取全部通道的电脑。如果遥控器允许设置通道对应的轴'
          + '（EdgeTX 可在高级模式的 USB 摇杆设置中配置），将四个摇杆分别设为 X、Y、Z 和 rotZ，'
          + ' Mixes page, clear channels 5 and 6 and give each of them one line whose source is the'
          + ' stick that does not arrive: Rud for yaw, Thr for throttle. Chrome keeps one of those two'
          + '且每个轴只分配一个通道，应该就能传递全部输入。试过后请在此页面报告结果。',
        'That should work on any EdgeTX or OpenTX radio, and nobody has confirmed it on a phone yet,'
          + ' so say whether it did with Report a bug from this screen. A radio whose channels cannot'
          + ' be changed, a DJI controller among them, needs a computer for now, which sees every axis.',
        RADIO_LINE,
      ],
    };
  }
  if (platform === 'windows') {
    return {
      title: '指示条不动？Windows',
      lines: [
        '检查 Windows 是否识别摇杆：按 Windows + R，输入 joy.cpl 并按 Enter，选择遥控器并打开“属性”，'
          + '然后拨动摇杆。如果那里能移动、此处却没有反应，请在此页面报告问题。',
        '如果那里也没有反应，说明遥控器没有发送信号。在 Windows 窗口中校准不会改变浏览器收到的输入，'
          + '因此无需在那里校准。',
        RADIO_LINE,
      ],
    };
  }
  if (platform === 'mac') {
    const blind = radioBlind('mac', browser);
    return {
      title: '指示条不动？Mac',
      lines: [
        ...(blind ? blind.lines : []),
        'macOS 没有内置的摇杆测试工具，因此请以这些指示条为准。如果摇杆在一个浏览器中有反应、'
          + '另一个浏览器中没有，请在此页面报告问题并注明浏览器。',
        RADIO_LINE,
      ],
    };
  }
  if (platform === 'linux') {
    return {
      title: '指示条不动？Linux',
      lines: [
        'jstest-gtk 或 evtest 可以查看遥控器发送的信号。如果摇杆在那里有反应、此处没有，'
          + '请在此页面报告问题。',
        ...(browser === 'firefox'
          ? ['Firefox 会将许多遥控器识别为游戏手柄，并重新排列其通道。EdgeTX 和 OpenTX'
            + ' 遥控器会按 Firefox 的排列方式读取；其他遥控器可重新校准摇杆，或改用 Chrome。']
          : []),
        RADIO_LINE,
      ],
    };
  }
  if (platform === 'ios') {
    return {
      title: '指示条不动？iPhone 和 iPad',
      lines: [
        ...radioBlind('ios', browser).lines,
        RADIO_LINE,
      ],
    };
  }
  return {
    title: '指示条不动？',
    lines: [
      `浏览器没有收到摇杆信号，此页面无法改变这一点。${four}`,
      RADIO_LINE,
    ],
  };
}
