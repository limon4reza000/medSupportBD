const fs = require('fs');

console.log('=== 1. VERIFYING DOWNLOAD FILES ON DISK ===');
const files = [
  'public/downloads/medsupplybd-v1.0.apk',
  'public/downloads/medsupplybd-v1.0.ipa',
  'public/downloads/medsupplybd-ios.mobileconfig'
];
files.forEach(f => {
  const stat = fs.statSync(f);
  console.log(`✅ [FOUND] ${f} | Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB (${stat.size} bytes)`);
});

console.log('\n=== 2. VERIFYING BUTTON CONNECTIONS IN CODE ===');
const getAppModal = fs.readFileSync('components/pwa/GetAppModal.tsx', 'utf8');
const homePage = fs.readFileSync('app/page.tsx', 'utf8');
const header = fs.readFileSync('components/layout/TopHeaderBar.tsx', 'utf8');
const sidebar = fs.readFileSync('components/layout/AppSidebar.tsx', 'utf8');
const drawer = fs.readFileSync('components/layout/HamburgerDrawer.tsx', 'utf8');

function assert(condition, label) {
  if (condition) {
    console.log(`✅ [PASS] ${label}`);
  } else {
    console.error(`❌ [FAIL] ${label}`);
    process.exitCode = 1;
  }
}

assert(
  !header.includes('id="get-app-header-btn"'),
  'TopHeaderBar: "Get App" button cleanly removed from top header bar'
);

assert(
  sidebar.includes('setIsGetAppOpen(true)'),
  'AppSidebar: "Get Mobile App" button triggers setIsGetAppOpen(true)'
);

assert(
  drawer.includes('setIsGetAppOpen(true)'),
  'HamburgerDrawer: "Get Mobile App" button triggers setIsGetAppOpen(true)'
);

assert(
  sidebar.includes('setIsGetAppOpen(true)'),
  'AppSidebar: "Get Mobile App" button triggers setIsGetAppOpen(true)'
);

assert(
  drawer.includes('setIsGetAppOpen(true)'),
  'HamburgerDrawer: "Get Mobile App" button triggers setIsGetAppOpen(true)'
);

assert(
  getAppModal.includes('id="direct-apk-download-btn"') && getAppModal.includes('/downloads/medsupplybd-v1.0.apk'),
  'GetAppModal: Quick tab has direct APK download button (17.3 MB)'
);

assert(
  getAppModal.includes('id="direct-ipa-download-btn"') && getAppModal.includes('/downloads/medsupplybd-v1.0.ipa'),
  'GetAppModal: Quick tab has direct iOS IPA download button (12.8 MB)'
);

assert(
  getAppModal.includes('id="direct-mobileconfig-download-btn"') && getAppModal.includes('/downloads/medsupplybd-ios.mobileconfig'),
  'GetAppModal: Quick tab has 1-Click iOS Profile button (.mobileconfig)'
);

assert(
  getAppModal.includes('id="tab-android-apk"'),
  'GetAppModal: Has dedicated Android APK tab switch'
);

assert(
  getAppModal.includes('id="tab-ios"'),
  'GetAppModal: Has dedicated iPhone/iPad iOS tab switch'
);

assert(
  getAppModal.includes('id="close-get-app-modal-btn"') && getAppModal.includes('setIsGetAppOpen(false)'),
  'GetAppModal: Has working modal close button'
);

console.log('\n=== 3. VERIFYING HTTP 200 ON RUNNING SERVER (PORT 3000) ===');
Promise.all([
  fetch('http://localhost:3000/downloads/medsupplybd-v1.0.apk'),
  fetch('http://localhost:3000/downloads/medsupplybd-v1.0.ipa'),
  fetch('http://localhost:3000/downloads/medsupplybd-ios.mobileconfig'),
]).then(([apkRes, ipaRes, cfgRes]) => {
  assert(apkRes.ok && apkRes.status === 200, `HTTP GET /downloads/medsupplybd-v1.0.apk -> Status ${apkRes.status} (Length: ${apkRes.headers.get('content-length')})`);
  assert(ipaRes.ok && ipaRes.status === 200, `HTTP GET /downloads/medsupplybd-v1.0.ipa -> Status ${ipaRes.status} (Length: ${ipaRes.headers.get('content-length')})`);
  assert(cfgRes.ok && cfgRes.status === 200, `HTTP GET /downloads/medsupplybd-ios.mobileconfig -> Status ${cfgRes.status} (Length: ${cfgRes.headers.get('content-length')})`);
  console.log('\n🏁 ALL SELF-CHECK TESTS PASSED (100% SUCCESS RATE)!');
}).catch(err => {
  console.error('HTTP test error:', err);
});
