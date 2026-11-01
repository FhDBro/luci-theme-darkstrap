<p align="center">
  <a href="https://github.com/FhDBro/luci-theme-darkstrap">
    <img src="assets/logo.png" alt="Darkstrap Logo" width="160" height="160">
  </a>
</p>

<h1 align="center">darkstrap</h1>

<p align="center">
  <strong>A clutter-free theme for OpenWrt LuCI.</strong>
</p>

<p align="center">
  <a href="#compatibility"><img src="https://img.shields.io/badge/OpenWrt-21.02_--_25.12.x-0284c7.svg?style=flat-square" alt="OpenWrt compatibility"></a>
  <a href="https://github.com/FhDBro/luci-theme-darkstrap/releases"><img src="https://img.shields.io/github/v/release/FhDBro/luci-theme-darkstrap?color=f59e0b&label=release&style=flat-square" alt="Latest Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/PRs-welcome-emerald.svg?style=flat-square" alt="PRs welcome">
</p>

<p align="center">
  <a href="#quick-install">Quick install</a> &bull;
  <a href="#features">Features</a> &bull;
  <a href="#comparisons">Comparisons</a> &bull;
  <a href="#screenshots">Screenshots</a> &bull;
  <a href="#compatibility">Compatibility</a> &bull;
  <a href="#build-from-source">Build from source</a>
</p>

---

## Quick install

Run this command on your router via SSH:

```sh
curl -sSL https://raw.githubusercontent.com/FhDBro/luci-theme-darkstrap/main/install.sh | sh
```

Or install via package manager once available in feeds:

```sh
# OpenWrt 25.12.x / 24.10+ (apk)
apk add luci-theme-darkstrap

# OpenWrt 23.05 / 22.03 / 21.02 (opkg)
opkg install luci-theme-darkstrap
```

---

## Features

- **Field Help Disclosures**: Long parameter explanations fold behind inline vector `?` buttons so dense configuration pages stay readable. Validation errors and critical alerts always stay visible.
- **Card-Aware Tooltip Boundary Clamping**: Port status and interface badges dynamically calculate viewport and parent card edges to stay fully visible on mobile, windowed, and desktop screens.
- **Interactive Form Elements**: Checkboxes render as smooth hardware-accelerated toggle switches with explicit focus rings and tactile state indicators.
- **Glassmorphism Modals**: Session expiry and configuration apply dialogs use translucent backgrounds with subtle blurs, keeping router status visible underneath.
- **Consistent Contrast & Typography**: Form fields, tabular data, and badges use high-contrast text tokens tested for extended monitoring sessions.

---

## Comparisons

### Network: DNS (Default vs Darkstrap)

![DNS Comparison](screenshots/comparison_dns.png)

Clicking the `?` icon discloses parameter documentation without shifting the form layout:

![DNS Help Revealed](screenshots/dns_disclosed.png)

---

## Screenshots

### Status: Overview
![Overview](screenshots/overview.png)

### Network: Wireless
![Wireless](screenshots/wireless.png)

### Network: Firewall
![Firewall](screenshots/firewall.png)

### Status: Realtime Bandwidth
![Realtime Traffic](screenshots/realtime.png)

### System: System Settings
![System Settings](screenshots/system_settings.png)

### Services: AdBlock Fast
![AdBlock Fast](screenshots/adblock.png)

### System: Startup Services
![Startup Services](screenshots/startup.png)

---

## Compatibility

- **OpenWrt 25.12.x** (SNAPSHOT)
- **OpenWrt 24.10**
- **OpenWrt 23.05**
- **OpenWrt 22.03**
- **OpenWrt 21.02**

Compatible with both `apk` and `opkg` package managers across standard ucode-based LuCI installations.

---

## Build from source

```sh
cd package/feeds/luci/
git clone https://github.com/FhDBro/luci-theme-darkstrap.git
make menuconfig # LuCI -> Themes -> luci-theme-darkstrap
make package/luci-theme-darkstrap/compile
```

---

## License

[Apache-2.0](LICENSE) &copy; Tawhidul Islam
