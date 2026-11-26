#!/bin/bash
set -euo pipefail

VERSION="${1:-0.9.9.6}"
PKG_NAME="luci-theme-darkstrap"
PKG_VERSION="${VERSION}-1"
OUTPUT_DIR="dist"

echo "Building packages for ${PKG_NAME} version ${PKG_VERSION}..."

rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "${BUILD_DIR}"' EXIT

DATA_DIR="${BUILD_DIR}/data"
CONTROL_DIR="${BUILD_DIR}/control"

mkdir -p "${DATA_DIR}/www/luci-static/darkstrap"
mkdir -p "${DATA_DIR}/usr/share/ucode/luci/template/themes/darkstrap"
mkdir -p "${DATA_DIR}/etc/uci-defaults"
mkdir -p "${CONTROL_DIR}"

# Copy static assets
cp -r htdocs/luci-static/darkstrap/* "${DATA_DIR}/www/luci-static/darkstrap/"
cp -r ucode/template/themes/darkstrap/* "${DATA_DIR}/usr/share/ucode/luci/template/themes/darkstrap/"
cp root/etc/uci-defaults/30_luci-theme-darkstrap "${DATA_DIR}/etc/uci-defaults/"
chmod 0755 "${DATA_DIR}/etc/uci-defaults/30_luci-theme-darkstrap"

# Calculate installed size in KB
INSTALLED_SIZE="$(du -sk "${DATA_DIR}" | cut -f1)"

# ----------------- 1. Build IPK (for opkg) -----------------
cat > "${CONTROL_DIR}/control" <<EOF
Package: ${PKG_NAME}
Version: ${PKG_VERSION}
Depends: luci-base, luci-theme-bootstrap
Section: luci
Architecture: all
Maintainer: Tawhidul Islam <fahadsart.bd2@gmail.com>
License: Apache-2.0
Description: A clutter-free dark theme for OpenWrt LuCI.
Installed-Size: ${INSTALLED_SIZE}
EOF

cat > "${CONTROL_DIR}/postrm" <<'EOF'
#!/bin/sh
[ -n "${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.Darkstrap
	uci commit luci
}
exit 0
EOF
chmod 0755 "${CONTROL_DIR}/postrm"

cat > "${CONTROL_DIR}/postinst" <<'EOF'
#!/bin/sh
[ -n "${IPKG_INSTROOT}" ] || {
	[ -f /etc/uci-defaults/30_luci-theme-darkstrap ] && /bin/sh /etc/uci-defaults/30_luci-theme-darkstrap
	/etc/init.d/uhttpd restart 2>/dev/null || true
}
exit 0
EOF
chmod 0755 "${CONTROL_DIR}/postinst"

echo "2.0" > "${BUILD_DIR}/debian-binary"

( cd "${CONTROL_DIR}" && tar --numeric-owner --owner=0 --group=0 -czf "${BUILD_DIR}/control.tar.gz" . )
( cd "${DATA_DIR}" && tar --numeric-owner --owner=0 --group=0 -czf "${BUILD_DIR}/data.tar.gz" . )

IPK_NAME="${PKG_NAME}_${PKG_VERSION}_all.ipk"
( cd "${BUILD_DIR}" && tar --numeric-owner --owner=0 --group=0 -czf "${IPK_NAME}" ./debian-binary ./control.tar.gz ./data.tar.gz )
cp "${BUILD_DIR}/${IPK_NAME}" "${OUTPUT_DIR}/"
echo "Created: ${OUTPUT_DIR}/${IPK_NAME}"

# ----------------- 2. Build APK (for apk) -----------------
BUILD_DATE="$(date +%s)"
APK_DIR="${BUILD_DIR}/apk"
mkdir -p "${APK_DIR}"
cp -r "${DATA_DIR}"/* "${APK_DIR}/"

cat > "${APK_DIR}/.PKGINFO" <<EOF
pkgname = ${PKG_NAME}
pkgver = ${VERSION}-r1
pkgdesc = A clutter-free dark theme for OpenWrt LuCI
url = https://github.com/FhDBro/luci-theme-darkstrap
builddate = ${BUILD_DATE}
packager = Tawhidul Islam <fahadsart.bd2@gmail.com>
size = $((INSTALLED_SIZE * 1024))
arch = noarch
license = Apache-2.0
depend = luci-base luci-theme-bootstrap
EOF

cat > "${APK_DIR}/.post-install" <<'EOF'
#!/bin/sh
[ -f /etc/uci-defaults/30_luci-theme-darkstrap ] && /bin/sh /etc/uci-defaults/30_luci-theme-darkstrap
/etc/init.d/uhttpd restart 2>/dev/null || true
exit 0
EOF
chmod 0755 "${APK_DIR}/.post-install"

cat > "${APK_DIR}/.post-deinstall" <<'EOF'
#!/bin/sh
uci -q delete luci.themes.Darkstrap
uci commit luci
exit 0
EOF
chmod 0755 "${APK_DIR}/.post-deinstall"

APK_NAME="${PKG_NAME}-${VERSION}-r1.apk"
( cd "${APK_DIR}" && tar --numeric-owner --owner=0 --group=0 -czf "${BUILD_DIR}/${APK_NAME}" . )
cp "${BUILD_DIR}/${APK_NAME}" "${OUTPUT_DIR}/"
echo "Created: ${OUTPUT_DIR}/${APK_NAME}"

echo "Package generation complete."
ls -lh "${OUTPUT_DIR}"
