# luci-theme-darkstrap

A simple, clutter-free, and easy-to-use dark theme for OpenWrt LuCI.

Standard LuCI pages place long paragraphs of text under each form field. Darkstrap hides those descriptions behind `?` buttons so pages stay clean, and switches checkboxes to toggles.

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

## Comparisons

### Network: DNS (Default vs Darkstrap)

![DNS Comparison](screenshots/comparison_dns.png)

Clicking the `?` icon reveals the field help text:

![DNS Help Revealed](screenshots/dns_disclosed.png)

## Screenshots

### Status: Overview

![Overview](screenshots/overview.png)

### Network: Wireless

![Wireless](screenshots/wireless.png)

### Network: Firewall

![Firewall](screenshots/firewall.png)

### Status: Realtime Bandwidth

![Realtime Traffic](screenshots/realtime.png)

### System: System

![System Settings](screenshots/system_settings.png)

### Services: AdBlock Fast

![AdBlock Fast](screenshots/adblock.png)

### System: Startup

![Startup Services](screenshots/startup.png)

## Compatibility

- OpenWrt 25.12.x (SNAPSHOT)
- OpenWrt 24.10
- OpenWrt 23.05
- OpenWrt 22.03
- OpenWrt 21.02

Works with both `apk` and `opkg` systems on any ucode-based LuCI installation.

## Build from source

```sh
cd package/feeds/luci/
git clone https://github.com/FhDBro/luci-theme-darkstrap.git
make menuconfig # LuCI -> Themes -> luci-theme-darkstrap
make package/luci-theme-darkstrap/compile
```

## License

Apache-2.0
