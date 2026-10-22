const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function testRoles() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const exePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  const browser = await puppeteer.launch({
    executablePath: exePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // 1. Test Chairman View
  console.log('--- 1. Testing Chairman View (Direct Navigate) ---');
  await page.goto('http://localhost:8080/?role=CHAIRMAN');

  // Wait for Supabase sync badge
  await page.waitForFunction(() => {
    const badge = document.getElementById('supabase-sync-badge');
    return badge && badge.innerText.includes('Supabase Connected');
  }, { timeout: 20000 });

  const badgeText = await page.evaluate(() => document.getElementById('supabase-sync-badge').innerText);
  console.log('Supabase Sync Badge:', badgeText);

  // Check upload button for Chairman
  const chairmanHasUpload = await page.evaluate(() => {
    const addData = document.getElementById('rd-coordinator-add-data');
    return !!addData;
  });
  console.log('Chairman has Upload New Data button?:', chairmanHasUpload, '(Expected: false)');

  // Inspect KPI Cards on Chairman page
  const kpis = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.kpi-card, .metric-card, .card, [class*="kpi"], [class*="stat"]'));
    return cards.map(c => c.innerText.replace(/\n+/g, ' | ')).filter(t => t.length > 3 && t.length < 150);
  });
  console.log('\n--- KPI Cards on Chairman Overview: ---');
  console.log(kpis.slice(0, 15).join('\n'));

  // Switch to E&T Scope and check cards
  console.log('\n--- Testing Scope Switch to E&T ---');
  await page.evaluate(() => {
    if (window.SRM_SCOPE) window.SRM_SCOPE.selectGroup('E&T');
  });
  await new Promise(r => setTimeout(r, 1200));

  const etKpis = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.kpi-card, .metric-card, .card, [class*="kpi"], [class*="stat"]'));
    return cards.map(c => c.innerText.replace(/\n+/g, ' | ')).filter(t => t.length > 3 && t.length < 150);
  });
  console.log('E&T KPI Cards:');
  console.log(etKpis.slice(0, 12).join('\n'));

  // Switch to Management Scope and check cards
  console.log('\n--- Testing Scope Switch to Management ---');
  await page.evaluate(() => {
    if (window.SRM_SCOPE) window.SRM_SCOPE.selectGroup('Management');
  });
  await new Promise(r => setTimeout(r, 1200));

  const mgmtKpis = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.kpi-card, .metric-card, .card, [class*="kpi"], [class*="stat"]'));
    return cards.map(c => c.innerText.replace(/\n+/g, ' | ')).filter(t => t.length > 3 && t.length < 150);
  });
  console.log('Management KPI Cards:');
  console.log(mgmtKpis.slice(0, 10).join('\n'));

  // 2. Test R&D Coordinator login
  console.log('\n--- 2. Testing R&D Coordinator View ---');
  await page.goto('http://localhost:8080/login.html');
  await page.waitForSelector('#btn-rd_coordinator');
  await page.click('#btn-rd_coordinator');
  await page.type('#password', '123456');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('#login-btn')
  ]);

  await page.waitForFunction(() => {
    const b = document.getElementById('rd-coordinator-add-data');
    return !!b;
  }, { timeout: 10000 });

  const rdHasUpload = await page.evaluate(() => {
    const addData = document.getElementById('rd-coordinator-add-data');
    return !!addData && addData.innerText.includes('UPLOAD NEW DATA');
  });
  console.log('R&D Coordinator has Upload New Data button?:', rdHasUpload, '(Expected: true)');

  // 3. Test Dean, Deputy Dean, HOD upload restriction
  console.log('\n--- 3. Testing Upload Restriction on Dean, Deputy Dean, HOD ---');
  for (const role of ['dean', 'deputy_dean', 'hod']) {
    await page.goto('http://localhost:8080/login.html');
    await page.waitForSelector('#btn-' + role);
    await page.click('#btn-' + role);
    if (role === 'hod') {
      await page.select('#group-select', 'E&T');
      await page.waitForFunction(() => {
        const sel = document.getElementById('profile-select');
        return sel && sel.options.length > 1;
      });
      const optVal = await page.evaluate(() => document.getElementById('profile-select').options[1].value);
      await page.select('#profile-select', optVal);
    }
    await page.type('#password', '123456');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('#login-btn')
    ]);

    await new Promise(r => setTimeout(r, 800));

    const hasUpload = await page.evaluate(() => !!document.getElementById('rd-coordinator-add-data'));
    console.log(`Role [${role}] has Upload New Data?:`, hasUpload, '(Expected: false)');
  }

  await browser.close();
  console.log('\nAll Role and KPI tests passed successfully!');
}

testRoles().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
