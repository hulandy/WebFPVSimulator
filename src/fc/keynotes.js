/*
 * keynotes.js: what a firmware key DOES, in a sentence a pilot can act on.
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
 * WHY THIS EXISTS.
 *
 * fieldNote() ended in `return field.key`, so the help column beside 115
 * typed rows on the firmware bench read the key name back at the pilot who
 * had just moved the cursor onto a row labelled with that key name. The one
 * column in this product that everybody praises, the plain-English
 * explanation beside the row, said "p_roll" next to p_roll.
 *
 * The catalog carries no descriptions: it is generated from Betaflight's own
 * settings table, which has a type, a range and a parameter group and no
 * prose at all. So the prose has to live somewhere, and it lives here rather
 * than in the generator, because the generator's output is regenerated from
 * vendored source and a hand-written sentence would be wiped by the next
 * `npm run gen:catalog`.
 *
 * TWO RULES, and the second one is the important one.
 *
 * A sentence says the CONSEQUENCE, not the expansion. "How hard it corrects
 * the error it can see right now" rather than "proportional gain": a pilot
 * who already knows what P stands for does not need the row, and one who
 * does not is no better off being told.
 *
 * And nothing here claims a meaning it cannot back. Where there is no
 * hand-written sentence the fallback states only what the catalog actually
 * knows, the units and the range and the tab, which is duller than an
 * invented explanation and is the reason to prefer it. A wrong sentence
 * about a filter cutoff costs a pilot an evening.
 *
 * Matched in order, first hit wins, so a specific key can sit above its
 * family.
 */
const NOTES = [
  /* ---- PID, per axis ------------------------------------------------ */
  [/^p_(roll|pitch|yaw)$/, '控制器对当前检测到的误差进行修正的力度。数值越大，保持姿态越有力，但螺旋桨气流扰动时也更容易抖动。'],
  [/^i_(roll|pitch|yaw)$/, '对持续一段时间的误差进行修正的力度。它能帮助四轴抵抗风力和较重电池的影响，保持姿态。'],
  [/^d_(roll|pitch|yaw)$/, '阻尼上限，用于抵抗快速运动，避免 P 项振荡。Betaflight 图形界面将其称为 D max。'],
  [/^d_min_(roll|pitch|yaw)$/, '阻尼下限，即摇杆静止时的 D 值。只有四轴快速运动时才会升向上限，因此平稳飞行时电机温度较低、噪声较小。'],
  [/^f_(roll|pitch|yaw)$/, '前馈会在误差出现前，根据摇杆的移动提前施力，让四轴随摇杆开始转向，而不是等误差出现后再响应。'],
  [/^d_min_advance$/, '陀螺仪转速上升时，D 项从下限升向上限的响应速度。'],
  [/^d_min_boost_gain$/, '快速动作时允许使用的 D 项上下限差值比例。'],

  /* ---- Iterm -------------------------------------------------------- */
  [/^iterm_relax$/, '选择摇杆移动时停止累积 I 项的轴。否则快速拨杆会积累 I 项，松杆后又回弹，造成横滚结束时的反弹。'],
  [/^iterm_relax_type$/, '选择松弛功能监测陀螺仪还是设定点。现代默认值为设定点，会根据你的输入而不是实际运动作出响应。'],
  [/^iterm_relax_cutoff$/, '摇杆移动达到何种速度时视为正在移动。数值越低，松弛保持时间越长，响应更平稳；数值越高，I 项越早开始累积，姿态保持能力更强。'],
  [/^iterm_windup$/, '电机达到饱和后停止增加 I 项，避免油门已满时继续累积无法输出的修正量。'],
  [/^iterm_limit$/, '限制 I 项可提供的最大修正量。'],
  [/^iterm_rotation$/, '四轴偏航时随机体旋转已累积的 I 项，避免旋转后横滚方向积累的 I 项反过来影响俯仰。'],

  /* ---- Anti gravity -------------------------------------------------- */
  [/^anti_gravity_gain$/, '快速改变油门时额外增加的 I 项。它能避免大油门爬升时机头下沉。'],
  [/^anti_gravity_(cutoff_hz|p_gain)$/, '调整抗重力对油门的响应：判断油门变化的速度，以及 I 项增强时附带的 P 项大小。'],

  /* ---- TPA and throttle ---------------------------------------------- */
  [/^tpa_rate$/, '高油门时降低 PID 增益的幅度。高速飞行需要更少修正；保持完整增益可能会让四轴直线飞行时震动。'],
  [/^tpa_breakpoint$/, '开始降低增益的油门位置。低于此位置时，增益不变。'],
  [/^tpa_mode$/, '选择 TPA 仅降低 D 项，还是同时降低 P 项和 D 项。'],
  [/^throttle_boost/, '快速改变油门时短暂增加油门，让快速爬升的响应比电机本身更灵敏。'],
  [/^thr_mid$/, '油门摇杆中点对应的输出位置。提高此值可提升悬停附近的控制精度，但会压缩高油门行程。'],
  [/^thr_expo$/, '柔化油门行程中段的响应，让悬停更容易保持，同时保留两端的可用行程。'],
  [/^throttle_limit_(type|percent)$/, '限制油门输出，可缩放整个范围或截断顶部输出。适合在狭窄赛道上降低高速四轴的速度。'],

  /* ---- Feedforward ---------------------------------------------------- */
  [/^feedforward_transition$/, '摇杆离开中心位置后逐渐启用前馈，避免放大中点附近的细微修正。'],
  [/^feedforward_smooth_factor$/, '平滑前馈信号。数值越大，响应越平稳但略有延迟；数值越小，响应越灵敏但噪声越明显。'],
  [/^feedforward_jitter_factor$/, '忽略遥控器常见的轻微摇杆抖动，避免前馈追随手指颤动。'],
  [/^feedforward_boost$/, '在摇杆动作最剧烈的阶段额外增加推力，叠加在前馈之上。'],
  [/^feedforward_max_rate_limit$/, '避免前馈请求超过速率限制的旋转速度。'],
  [/^feedforward_averaging$/, '对多个遥控帧的前馈信号取平均。慢速链路下更平滑，快速链路下延迟更明显。'],

  /* ---- Filters -------------------------------------------------------- */
  [/^gyro_lpf1_dyn_(min|max)_hz$/, '动态陀螺仪滤波器的频率范围。四轴平稳时频率较低，动作时逐渐提高，兼顾巡航时的安静和转弯时的灵敏度。'],
  [/^gyro_lpf1_(type|static_hz)$/, '第一阶陀螺仪低通滤波器。数值较低时信号更干净，但电机温度更高；数值较高时响应更灵敏，但噪声更多。电机过热时通常先调整此截止频率。'],
  [/^gyro_lpf2_/, '位于第一阶之后的第二阶陀螺仪低通滤波器，用于进一步抑制第一阶未滤除的噪声。'],
  [/^dterm_lpf1_dyn_(min|max)_hz$/, '动态 D 项滤波器的频率范围。D 项噪声通常最大，因此此滤波器往往决定电机温度。'],
  [/^dterm_lpf1_/, '第一阶 D 项低通滤波器。降低截止频率通常可缓解电机过热，但会削弱部分阻尼能力。'],
  [/^dterm_lpf2_/, '位于第一阶之后的第二阶 D 项低通滤波器。'],
  [/^dterm_notch_/, '在 D 项中针对机架共振频率设置的窄带陷波。'],
  [/^dyn_notch_count$/, '同时追踪电机噪声的动态陷波数量。数量越多，能捕捉的噪声越多，但延迟也会增加。'],
  [/^dyn_notch_q$/, '每个动态陷波的带宽。数值越高，陷波越窄，滤除的信号和噪声越少，但需要更精确地捕捉噪声频率。'],
  [/^dyn_notch_(min|max)_hz$/, '动态陷波可追踪的频率范围。下限应高于机架的固有共振频率，否则陷波可能会持续停留在该频率。'],
  [/^rpm_filter_harmonics$/, '需要滤除的电机转动频率倍数。四轴噪声中大部分来自前两个倍频。'],
  [/^rpm_filter_q$/, 'RPM 陷波的带宽。该滤波器会精确跟踪电机，因此可以使用较窄的带宽。'],
  [/^rpm_filter_(min_hz|fade_range_hz|lpf_hz|weights)/, '调整 RPM 陷波滤波器，包括开始生效的频率、渐入范围和各倍频的滤除强度。'],
  [/^yaw_lowpass_hz$/, '仅作用于偏航轴的低通滤波器。偏航运动比横滚和俯仰更慢、负载更重，因此可承受更强的滤波。'],
  [/^simplified_/, 'Betaflight 简化调校滑块之一。移动滑块会像固件一样整体改写一组 PID 或滤波器参数。“四轴”页面也使用这些滑块，但步进更少。'],

  /* ---- Rates ---------------------------------------------------------- */
  [/^rates_type$/, '选择摇杆使用的速率曲线类型。Betaflight 的五种曲线均已编译，可选择任意一种用于飞行。'],
  [/_srate$|_rc_rate$|_expo$/, '速率曲线参数，用于决定摇杆的最大转速和达到该转速的响应速度。“速率”页面会实时绘制曲线，建议在那里调整。'],

  /* ---- Angle and horizon ---------------------------------------------- */
  [/^angle_limit$/, '限制角度模式下四轴的最大倾斜角度，也是松开摇杆后自动恢复水平时的倾斜上限。'],
  [/^level_/, '控制角度模式和地平线模式将四轴拉回水平的力度和速度。'],
  [/^horizon_/, '调整地平线模式的响应。该模式在摇杆中点附近类似角度模式，在摇杆行程两端类似特技模式。'],

  /* ---- Airmode and motors --------------------------------------------- */
  [/^motor_output_limit$/, '限制混控器可使用的电机输出范围。'],
  [/^motor_poles$/, '电机磁极数量，用于将 ESC 报告的 eRPM 换算为实际 RPM。'],
  [/^(mixer_type|thrust_linear)/, '混控器将控制器的横滚、俯仰、偏航和油门指令转换为四个电机输出的方式。'],
  [/^idle_min_rpm$|^dshot_idle_value$/, '电机怠速强度。适当的怠速可让螺旋桨保持负载，避免下降时翻滚；过高则会让四轴自行爬行。'],
];

/*
 * The fallback. Only what the catalog actually knows, which is duller than an
 * invented explanation and is exactly why it is preferred. See the rules
 * above.
 */
export function genericNote(field) {
  const bits = [];
  if (field.lookup) {
    bits.push('从 Betaflight 自带列表中选择一项。');
  } else if (Number.isFinite(field.min) && Number.isFinite(field.max)) {
    bits.push(`数值范围为 ${field.min} 至 ${field.max}${field.units ? ` ${field.units}` : ''}。`);
  }
  bits.push('此参数暂时没有说明，因此不会臆测其用途。');
  return bits.join(' ');
}

export function keyNote(field) {
  if (!field || !field.key) {
    return '';
  }
  for (const [re, note] of NOTES) {
    if (re.test(field.key)) {
      return note;
    }
  }
  return genericNote(field);
}

/* How many of the catalog's keys have a written sentence, for the lint that
 * keeps this file honest as the catalog grows. */
export function hasKeyNote(key) {
  return NOTES.some(([re]) => re.test(String(key || '')));
}
