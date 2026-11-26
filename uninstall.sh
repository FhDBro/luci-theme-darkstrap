#!/bin/sh
set -e

echo "Uninstalling luci-theme-darkstrap..."

# Revert to bootstrap theme
uci -q delete luci.themes.Darkstrap
uci set luci.main.mediaurlbase='/luci-static/bootstrap'
uci commit luci

# Remove theme files
rm -rf /www/luci-static/darkstrap
rm -rf /usr/share/ucode/luci/template/themes/darkstrap
rm -f /etc/uci-defaults/30_luci-theme-darkstrap

/etc/init.d/uhttpd restart 2>/dev/null || true

echo "Darkstrap uninstalled successfully. Reverted to default theme."
