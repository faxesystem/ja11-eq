// Fixed device description for the FiiO / JadeAudio JA11 (USB 2972:0102).
//
// Equivalent to what devicePEQ resolves at runtime from usbDeviceConfig.js
// ("JadeAudio JA11" entry merged over the FiiO defaults) plus the
// "peq5Band12dBFullShelves" profile from peqConstraintsConfig.json.
// Inlined here so this project doesn't need devicePEQ's full device registry.

export const JA11 = {
  vendorId: 0x2972,
  productId: 0x0102,
  model: 'JadeAudio JA11',
  manufacturer: 'FiiO',
};

export const JA11_MODEL_CONFIG = Object.freeze({
  // slots: 0 Vocal, 1 Classic, 2 Bass (factory, read-only), 3 USER1 (writable), 4 = EQ off
  firstWritableEQSlot: 3,
  maxWritableEQSlots: 1,
  disabledPresetId: 4,
  availableSlots: [
    { id: 0, name: 'Vocal' }, { id: 1, name: 'Classic' }, { id: 2, name: 'Bass' }, { id: 3, name: 'USER1' },
  ],
  disconnectOnSave: true,
  reportId: 2,
  experimental: false,

  // filter limits
  maxFilters: 5,
  minGain: -12,
  maxGain: 12,
  minQ: 0.1,
  maxQ: 10.0,
  supportsLSFilter: true,
  supportsHSFilter: true,
  supportsLPFilter: false,
  supportsHPFilter: false,
  supportsRead: true,
  deviceHandlesPregain: false,
  supportsManualGlobalGain: true,
});
