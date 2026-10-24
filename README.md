# JA11 EQ

A 5-band parametric equalizer for the **FiiO / JadeAudio JA11** USB DAC dongle that runs in your browser.
You don't need the FiiO app or an Android phone. It works in Chrome, Brave or Edge through WebHID.

**Open it in your browser: <https://faxesystem.github.io/ja11-eq/>**. Nothing to install, and the page talks to the
dongle directly from your browser.

---

## Background

I built this for a **JCALLY JM12** (KTMicro **KT02H20** chip) that I cross-flashed to FiiO's official
**JA11 V2.2** firmware:

- **Flashing tool:** [fiio-ja11-jcally-jm12-moondropkt02-kt02h20-dac-amp-toolkit](https://github.com/ParkWardRR/fiio-ja11-jcally-jm12-moondropkt02-kt02h20-dac-amp-toolkit)
  (`ktflash` plus the macOS helper `ktmac`)
- **Firmware:** FiiO JA11 V2.2 from the
  [FiiO forum](https://forum.fiio.com/note/showNoteContent.do?id=202406211150090736905&tid=77)

After the flash, the dongle shows up as `JadeAudio JA11` (USB `2972:0102`). FiiO's app only edits the PEQ on
Android, which is why I made this tool.

This repository does **not** include the firmware. It belongs to FiiO and is only available from the link above.

> [!WARNING]
> Cross-flashing is unofficial and you do it at your own risk. You can't back up the original firmware first,
> and going back to stock needs a matching stock image (see `docs/REVERT.md` in the toolkit). This project
> never flashes anything. It only talks to the EQ of a dongle that already runs JA11 firmware.

## Based on devicePEQ

The USB communication comes from **[devicePEQ](https://github.com/jeromeof/devicePEQ)** by Jerome O'Flaherty
(Pragmatic Audio, 0BSD license). Only the FiiO HID driver and two helper modules are included (`lib/`), with
fixes for the JA11 (see [Changes to devicePEQ](#changes-to-devicepeq)). The UI, response graph, import and
pre-gain handling are new.

## Features

- **Presets:** switch between Off, Vocal, Classic, Bass and USER1. The page marks the preset the dongle is running.
- **Only USER1 is editable.** You can view the factory presets and copy them to USER1.
- **Frequency response graph** with draggable band markers, plus a band strip for each band's type
  (bell / low shelf / high shelf), frequency, gain and Q.
- **Save** writes USER1 permanently and makes it the start-up preset. **Start with EQ off** sets the dongle
  back to EQ off.
- **Import into USER1:**
  - [graph.hangout.audio](https://graph.hangout.audio) / squig.link: the file from “Export Parametric EQ”, or
    the “Share your PEQ” link (press Cmd/Ctrl+V anywhere on the page)
  - AutoEQ (“Equalizer APO” format) and REW filter exports (choose a file or drop it onto the graph)
  - profiles with more than 5 filters are cut down to their 5 strongest
- **Pre-gain:** adjustable, default +12 dB (see below). *Auto* uses 12 dB minus the largest boost.
- **Neutral reset:** sets USER1 flat and makes the dongle start with EQ off.
- Reconnects on its own after you plug the dongle in or save.
- Light and dark theme (follows the system, can be toggled).
- Keeps the draft and settings in the browser (localStorage).

## Running it

WebHID only works in Chromium browsers (Chrome, Brave, Edge), and only on `https://` or `localhost`.
Firefox and Safari don't support it.

The easiest way is the hosted version at <https://faxesystem.github.io/ja11-eq/>. To run it locally instead:

```sh
git clone https://github.com/faxesystem/ja11-eq.git
cd ja11-eq
python3 -m http.server 8790 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8790/>, plug in the dongle, click **Connect** and pick “JadeAudio JA11”.
Any static web server works, and there's no build step.

## Usage

| Action | How |
|---|---|
| Move a band | drag its marker (left/right = frequency, up/down = gain) |
| Width (Q) | scroll on the marker, or type it in the band strip |
| Band to 0 dB | double-click the marker |
| Enter values | type into the band strip, e.g. `2.5k`, `-3`, `0.7` |
| Apply | **Save** (the dongle drops off briefly and reconnects) |

## What I found out about the JA11

Tested on JA11 V2.2 running on a JCALLY JM12:

- **Preset numbers** (HID command `0x16`): 0 Vocal, 1 Classic, 2 Bass, 3 USER1, 4 EQ off.
- **Saving** (`AA 0A 00 00 19 01 <slot> 00 EE`) writes to flash. The dongle starts with whichever preset you
  saved last: slot 3 for USER1, slot 4 for EQ off. If you only switch without saving, the change lasts until
  you unplug the dongle.
- **Level:** the firmware attenuates USER1 internally by a fixed **12 dB** (headroom for the maximum +12 dB
  boost). The global gain (`0x17`) makes up for it: **+12 dB is as loud as the factory presets** (compared by
  ear). At 0 dB, USER1 is clearly quieter.
- The **reset command** `0x1B` (no payload) did nothing on the JA11.
- **Re-flashing** doesn't erase the EQ settings, because they live outside the firmware region.
- The graph uses RBJ biquads at 48 kHz. According to devicePEQ, FiiO firmware renders shelves slightly steeper,
  so treat the curve as a guide, not a measurement.

## Changes to devicePEQ

In `lib/fiioUsbHidHandler.js` (also noted at the top of the file):

1. **Saving is awaited.** Upstream sends the save report without awaiting it, and the caller closes the HID
   device right away (`disconnectOnSave`). As a result the save often never arrived, and the settings were
   gone after a power cycle.
2. **“EQ off” uses `disabledPresetId`** (JA11: 4) instead of `maxFilters` (5, which is not a defined preset).
3. **Saving while “EQ off” is selected** stores preset 4 as the start-up preset instead of writing filters into
   an invalid slot.

Two more issues affect only devicePEQ's generic UI, which this repo doesn't include. The slot selector gets
removed from the DOM during initialisation. And the “minus the largest boost” pre-gain rule leaves USER1 on the
JA11 more than 12 dB too quiet.

`lib/ja11Config.js` replaces devicePEQ's device registry with the fixed JA11 values.

## License

- This project: [0BSD](LICENSE)
- `lib/fiioUsbHidHandler.js`, `lib/compensation.js`, `lib/deviceDebugLog.js`: from devicePEQ, 0BSD (see
  [LICENSE-devicePEQ.txt](LICENSE-devicePEQ.txt))

FiiO, JadeAudio, JCALLY, KTMicro and all other names mentioned here are trademarks of their respective owners.
This project is not affiliated with, endorsed by or reviewed by any of these companies. Use at your own risk.
