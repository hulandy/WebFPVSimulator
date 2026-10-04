/*
 * pids.js: the pilot's PID adjustment, and the only place it is decided.
 *
 * WHAT THIS IS. The flight-controller screen went because eight tabs and a
 * CLI textarea helped nobody, and for a while the PIDs went with it: two
 * fixed tunes and no way to move them. A beta tester then reported both
 * tunes floppy and said they used to push the PIDs to 200-300 percent.
 * This module is the answer: Betaflight Configurator's own tuning sliders,
 * and an expert table for setting PIDs directly, with no CLI paste
 * anywhere. That report was once answered with a preset as well, a stiff
 * cut shipped beside the default. The presets are gone and the control is
 * the whole answer now, which is the right way round: a pilot who wants a
 * stiffer quad should move the knob and know what they moved.
 *
 * NOTHING HERE COMPUTES A PID. A slider adjustment is emitted as the
 * firmware's own `set simplified_*` keys followed by the real CLI command
 * `simplified_tuning apply`, so the arithmetic that turns a master
 * multiplier of 185 into P83 is Betaflight's config/simplified_tuning.c,
 * compiled into the module, exactly as it is when Configurator drags a
 * slider. The expert table is emitted as plain `set p_roll = ...` lines
 * with `simplified_pids_mode = OFF`, which is exactly what Configurator's
 * expert mode writes. Per CLAUDE.md: the behaviour was already compiled,
 * this file only asks for it.
 *
 * PER TUNE, NOT PER PILOT, and this is the decision that makes the tunes
 * stay comparable. Rates are global because how far the stick goes belongs
 * to the hand that holds it; PIDs belong to the tune, so an adjustment is
 * keyed by tune id and switching tunes switches to that tune's own
 * adjustment (usually none). A single global override would make the Tune
 * row a lie: every choice would fly the same numbers.
 *
 * SPARSE ON PURPOSE. A slider the pilot has not moved is not stored and
 * not emitted, so the tune's own value keeps governing it; move the master
 * on a tune and that tune's own I, D and feedforward sliders keep doing
 * their work underneath it, which is what Configurator does with a preset
 * loaded. Putting a slider back on the tune's own value deletes the
 * override rather than storing a copy, so "back where it was" and "stock"
 * are the same state and the same config text, and the best-lap record key
 * (a hash of that text) agrees.
 *
 * UNITS AND BOUNDS. Sliders are the firmware's uint8 percent, 100 is the
 * tune's own scale. The compiled CLI shim does not enforce the valueTable
 * ranges (it took 250 and flew it, measured), so the menu owns the clamp:
 * 200 is SIMPLIFIED_TUNING_MAX and the six sliders that scale a gain are
 * floored at 30 here, because a master of zero is a craft with no
 * controller, reported as a physics bug by whoever types it. Zero of
 * feedforward and zero of dynamic damping are real setups and stay legal.
 * The expert table uses the firmware's own bounds from the 4.5.1
 * valueTable: PID_GAIN_MAX 250, D_MIN_GAIN_MAX 250, F_GAIN_MAX 1000.
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

import { CUSTOM_TUNE, TUNES } from './registry.js';

/* Every id an adjustment may be keyed by: the shipped tunes plus the
 * pilot's own saved dump, which the PIDs screen adjusts like any other
 * tune once it exists. */
const ADJUSTABLE = [...TUNES, CUSTOM_TUNE];

/*
 * One slider, in the shape src/ui/ui.js number() rows read: cliMin and
 * cliMax are the stored bounds, scale and decimals say how the number is
 * written, unit is printed after the field. One arrow press is one
 * percent, because the firmware holds whole percent and there is nothing
 * finer to move to.
 */
function slider(cli, label, cliMin, note) {
  return {
    cli, label, cliMin, cliMax: 200, scale: 1, decimals: 0, unit: '%', note,
  };
}

/* Configurator's slider set, master first because it is the one the
 * feedback asked for. The keys are this module's own short names; the CLI
 * key each one writes is in `cli`. */
export const SLIDER_KEYS = ['master', 'pi', 'i', 'd', 'dmax', 'ff', 'pitchPi', 'pitchD'];

export const SLIDERS = {
  master: slider('simplified_master_multiplier', '总倍率', 30,
    '同时缩放 P、I、D 和前馈，并保持它们之间的比例。这是用于增强操控刚性的滑块，也是飞行手感反馈中最常提到的设置。默认值为 100；此前提供的增强预设为 185，大致对应反馈所建议的调整幅度。'),
  pi: slider('simplified_pi_gain', '跟踪，P 与 I', 30,
    '四轴追随摇杆目标转速的力度。数值低时响应迟缓且平滑，数值高时会迅速跟上并保持设定点。'),
  i: slider('simplified_i_gain', '漂移与摆动，I', 30,
    '仅调整慢速误差项。数值过低时，连续动作中姿态会漂移；数值过高时，长时间动作会累积过多修正量，摇杆回中时产生抖动。在此飞行模型中，抖动会先于漂移出现。'),
  d: slider('simplified_d_gain', '阻尼，D', 30,
    '抵抗旋转、平滑停止动作并减轻螺旋桨气流扰动。真实四轴上的 D 项会增加电机温度和陀螺仪噪声；此模型的陀螺仪信号较干净，因此增加阻尼几乎没有代价，增强型调校也会使用较高数值。'),
  dmax: slider('simplified_dmax_gain', '动态阻尼，D max', 0,
    '快速动作和停止时，在基础 D 项之上增加的阻尼量。零表示 D 项保持不变。'),
  ff: slider('simplified_feedforward_gain', '摇杆响应，前馈', 0,
    '在误差出现前，根据摇杆移动直接施加前馈。数值高时响应更快；过高则会在每次动作开始时过冲。零表示仅使用 P 项和 D 项飞行。'),
  pitchPi: slider('simplified_pitch_pi_gain', '俯仰跟踪', 30,
    '俯仰 P 项和 I 项相对横滚的比例。四轴机身前后长于左右宽，因此俯仰通常会高出几个百分点。'),
  pitchD: slider('simplified_pitch_d_gain', '俯仰阻尼', 30,
    '俯仰 D 项相对横滚的比例，原因与俯仰跟踪相同。'),
};

/* The expert table, Configurator's columns in Configurator's order. The
 * naming trap is written down where it bites: the column Configurator
 * calls D is the CLI's d_min_*, and the column it calls D Max is the
 * CLI's d_*, because Betaflight 4.3 renamed the display and not the
 * firmware. pidCliKey below is the one place the mapping exists. */
export const PID_AXES = ['roll', 'pitch', 'yaw'];
export const PID_FIELDS = ['p', 'i', 'd', 'dmax', 'f'];

function pidField(label, cliMax, note) {
  return {
    label, cliMin: 0, cliMax, scale: 1, decimals: 0, unit: '', note,
  };
}

export const PID_FIELD_SPECS = {
  p: pidField('P', 250,
    '比例项：四轴当前追随摇杆所要求转速的力度，也就是操控刚性调节项。'),
  i: pidField('I', 250,
    '积分项：抵抗缓慢、持续误差以保持姿态。数值过高时，持续动作会累积修正量，并在摇杆回中时产生抖动。'),
  d: pidField('D', 250,
    '阻尼项，对应 CLI 参数 d_min，也是大部分时间实际使用的 D 值。配置器称其为 D，固件称其为 d_min，两者均指此数值。'),
  dmax: pidField('D max', 250,
    '快速动作和停止时 D 项上升到的上限，对应 CLI 参数 d_roll / d_pitch / d_yaw。请注意下限：D max 小于或等于 D 时，固件会关闭 D 到 D max 的动态范围，并始终使用此数值（pid_init.c 以 d_min < D 为启用条件）。因此，D max 为零表示零阻尼，而非保持 D 不变。'),
  f: pidField('Feedforward', 1000,
    '在误差出现前，根据摇杆移动直接施力。此项用于调节响应的即时性。'),
};

export function pidCliKey(field, axis) {
  const stem = { p: 'p', i: 'i', d: 'd_min', dmax: 'd', f: 'f' }[field];
  return `${stem}_${axis}`;
}

/*
 * Betaflight 4.5.1's own factory PIDs, in this module's display shape (d
 * is d_min, dmax is d). From pgResetTemplate in flight/pid.c, and read
 * back identically from the compiled module. The panel notches its bars
 * with these, and the expert table falls back to them when it has to be
 * seeded before the module has been read.
 */
export const STOCK_PIDS = Object.freeze({
  roll: Object.freeze({ p: 45, i: 80, d: 30, dmax: 40, f: 120 }),
  pitch: Object.freeze({ p: 47, i: 84, d: 34, dmax: 46, f: 125 }),
  yaw: Object.freeze({ p: 45, i: 80, d: 0, dmax: 0, f: 120 }),
});

function clampTo(spec, value) {
  /* null and '' are ABSENT, not zero. Number(null) is 0, so without this
   * a hand-edited blob with "master": null would clamp to the floor and
   * fly it instead of being dropped. */
  if (value == null || value === '') {
    return null;
  }
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) {
    return null;
  }
  return Math.max(spec.cliMin, Math.min(spec.cliMax, n));
}

/*
 * Clamp a stored adjustment onto what the firmware and the menu will take.
 * Same contract as normaliseRates: a localStorage blob from an older
 * build, a hand edit, or a bug upstream cannot put an out-of-range number
 * into a uint8 field or an unknown tune id into the emitter. An expert
 * entry whose table is incomplete falls back to sliders rather than
 * flying a half-table, and an entry adjusting nothing is dropped, so
 * "stock" has exactly one representation.
 */
export function normalisePids(p) {
  const out = {};
  if (!p || typeof p !== 'object') {
    return out;
  }
  for (const t of ADJUSTABLE) {
    const e = p[t.id];
    if (!e || typeof e !== 'object') {
      continue;
    }
    const given = e.sliders && typeof e.sliders === 'object' ? e.sliders : {};
    const sliders = {};
    for (const k of SLIDER_KEYS) {
      const v = clampTo(SLIDERS[k], given[k]);
      if (v != null && k in given) {
        sliders[k] = v;
      }
    }
    let pids = null;
    if (e.pids && typeof e.pids === 'object') {
      pids = {};
      for (const axis of PID_AXES) {
        const a = e.pids[axis] && typeof e.pids[axis] === 'object' ? e.pids[axis] : {};
        pids[axis] = {};
        for (const f of PID_FIELDS) {
          const v = clampTo(PID_FIELD_SPECS[f], a[f]);
          if (v == null) {
            pids = null;
            break;
          }
          pids[axis][f] = v;
        }
        if (!pids) {
          break;
        }
      }
    }
    const mode = e.mode === 'expert' && pids ? 'expert' : 'sliders';
    if (!pids && Object.keys(sliders).length === 0) {
      continue;
    }
    const entry = { mode, sliders };
    if (pids) {
      entry.pids = pids;
    }
    out[t.id] = entry;
  }
  return out;
}

/* The stored entry for one tune, or null. The rows mutate this through
 * the helpers below; loadSettings has already normalised it. */
export function pidsEntry(p, tuneId) {
  const e = p && typeof p === 'object' ? p[tuneId] : null;
  return e && typeof e === 'object' ? e : null;
}

function ensureEntry(p, tuneId) {
  if (!pidsEntry(p, tuneId)) {
    p[tuneId] = { mode: 'sliders', sliders: {} };
  }
  return p[tuneId];
}

/* Drop an entry that no longer adjusts anything, so that walking a slider
 * back to the tune's own value IS reverting and the record key agrees. */
function pruneEntry(p, tuneId) {
  const e = pidsEntry(p, tuneId);
  if (e && e.mode !== 'expert' && Object.keys(e.sliders).length === 0 && !e.pids) {
    delete p[tuneId];
  }
}

/*
 * Move one slider. `tuneValue` is the value the TUNE itself holds for
 * this slider, read out of the running module; landing back on it deletes
 * the override instead of storing a copy of the tune.
 */
export function setPidSlider(p, tuneId, key, value, tuneValue) {
  const v = clampTo(SLIDERS[key], value);
  if (v == null) {
    return;
  }
  const e = ensureEntry(p, tuneId);
  if (tuneValue != null && v === tuneValue) {
    delete e.sliders[key];
  } else {
    e.sliders[key] = v;
  }
  pruneEntry(p, tuneId);
}

/*
 * Enter or leave the expert table. Entering seeds the table from `seed`,
 * which the caller reads out of the running module, so the first edit
 * starts from exactly what is flying; the stored slider overrides are
 * kept, inactive, so leaving expert restores them. Leaving keeps the
 * table too, inactive, so a pilot can flip back without losing work.
 */
export function setPidsExpert(p, tuneId, on, seed) {
  const e = ensureEntry(p, tuneId);
  if (on) {
    e.mode = 'expert';
    if (!e.pids) {
      const src = seed || STOCK_PIDS;
      e.pids = {};
      for (const axis of PID_AXES) {
        e.pids[axis] = {};
        for (const f of PID_FIELDS) {
          e.pids[axis][f] = clampTo(PID_FIELD_SPECS[f], src[axis] ? src[axis][f] : null)
            ?? STOCK_PIDS[axis][f];
        }
      }
    }
  } else {
    e.mode = 'sliders';
  }
  pruneEntry(p, tuneId);
}

export function clearPidsFor(p, tuneId) {
  if (p && typeof p === 'object') {
    delete p[tuneId];
  }
}

export function pidsAdjusted(p, tuneId) {
  return pidsDiffFor(p, tuneId) !== '';
}

/*
 * The adjustment as Betaflight CLI text, appended to the tune by
 * composeConfig in src/fc/dump.js, BEFORE the rates block so the rates
 * stay the last word on their own keys. Empty when nothing is adjusted,
 * and that emptiness is a contract: an untouched tune composes to exactly
 * the text it composed to before this module existed, so every stored
 * best lap keeps its key.
 *
 * The sliders block does not set simplified_pids_mode. The tune's own
 * mode governs, which is why the master reaches yaw on the shipped default
 * (RPY) and leaves yaw alone on a dump that carries RP, exactly as
 * Configurator behaves with those loaded. No shipped tune is RP any more,
 * the two that were are gone, but a pilot's own dump still can be and the
 * yaw note on the PIDs screen still reads the live baseline to say so.
 */
export function pidsDiffFor(p, tuneId) {
  const e = normalisePids(p)[tuneId];
  if (!e) {
    return '';
  }
  if (e.mode === 'expert') {
    const lines = [
      '',
      '# PIDs, set by hand on the PIDs screen. See configs/pids.js.',
      'profile 0',
      'set simplified_pids_mode = OFF',
    ];
    for (const axis of PID_AXES) {
      for (const f of PID_FIELDS) {
        lines.push(`set ${pidCliKey(f, axis)} = ${e.pids[axis][f]}`);
      }
    }
    lines.push('');
    return lines.join('\n');
  }
  const keys = SLIDER_KEYS.filter((k) => k in e.sliders);
  if (keys.length === 0) {
    return '';
  }
  const lines = [
    '',
    '# PID sliders, from the PIDs screen. See configs/pids.js.',
    'profile 0',
  ];
  for (const k of keys) {
    lines.push(`set ${SLIDERS[k].cli} = ${e.sliders[k]}`);
  }
  lines.push('simplified_tuning apply', '');
  return lines.join('\n');
}

/* One phrase for the menu row, so the pilot can see whether the tune
 * under the cursor is stock without opening the screen. */
export function pidsSummary(p, tuneId) {
  const e = normalisePids(p)[tuneId];
  if (!e) {
    return 'Stock';
  }
  if (e.mode === 'expert') {
    return 'Set by hand';
  }
  const keys = SLIDER_KEYS.filter((k) => k in e.sliders);
  if (keys.length === 0) {
    return 'Stock';
  }
  if ('master' in e.sliders) {
    const rest = keys.length - 1;
    return rest === 0
      ? `Master ${e.sliders.master}%`
      : `Master ${e.sliders.master}%, ${rest} more slider${rest === 1 ? '' : 's'}`;
  }
  return `${keys.length} slider${keys.length === 1 ? '' : 's'} moved`;
}
