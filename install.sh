#!/bin/sh
set -e

REPO="https://raw.githubusercontent.com/FhDBro/luci-theme-darkstrap/main"

echo "Installing luci-theme-darkstrap..."

mkdir -p /www/luci-static/darkstrap
mkdir -p /usr/share/ucode/luci/template/themes/darkstrap
mkdir -p /etc/uci-defaults

for f in cascade.css mobile.css theme.js logo.svg abstract-form.svg; do
    curl -sSL -o "/www/luci-static/darkstrap/$f" "$REPO/htdocs/luci-static/darkstrap/$f"
done

for f in header.ut footer.ut sysauth.ut; do
    curl -sSL -o "/usr/share/ucode/luci/template/themes/darkstrap/$f" "$REPO/ucode/template/themes/darkstrap/$f"
done

curl -sSL -o "/etc/uci-defaults/30_luci-theme-darkstrap" "$REPO/root/etc/uci-defaults/30_luci-theme-darkstrap"

uci set luci.themes.Darkstrap='/luci-static/darkstrap'
uci set luci.main.mediaurlbase='/luci-static/darkstrap'
uci commit luci

/etc/init.d/uhttpd restart 2>/dev/null || true

echo "Darkstrap installed and activated."
