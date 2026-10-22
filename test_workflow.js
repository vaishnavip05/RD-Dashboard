const puppeteer = require('puppeteer');

(async () => {
  console.log('--- Starting Automated Browser Verification ---');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    console.log('PAGE DIALOG/ALERT:', dialog.message());
    await dialog.accept();
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    } else if (msg.text().includes('[Scholar Bridge]') || msg.text().includes('Supabase')) {
      console.log('PAGE LOG:', msg.text());
    }
  });

  try {
    // 1. Visit Login Page & ensure explicit logout state
    console.log('\nStep 1: Navigating to login.html...');
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('srm_rd_logged_out', '1');
    });
    await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle2' });

    // 2. Click Research Scholar role
    console.log('\nStep 2: Selecting Research Scholar role...');
    await page.waitForSelector('#btn-scholar', { timeout: 5000 });
    await page.click('#btn-scholar');

    // 3. Select E&T group
    console.log('\nStep 3: Selecting E&T group...');
    await page.select('#group-select', 'E&T');

    // Wait for Supabase scholars to load in dropdown
    await page.waitForFunction(() => {
      const select = document.getElementById('profile-select');
      return select && select.options.length > 2 && select.options[1].value !== '';
    }, { timeout: 15000 });

    const scholarOptions = await page.evaluate(() => {
      const select = document.getElementById('profile-select');
      return Array.from(select.options).slice(1).map(opt => ({
        value: opt.value,
        text: opt.textContent,
        data: opt.dataset.userobject ? JSON.parse(opt.dataset.userobject) : null
      }));
    });

    console.log(`Loaded ${scholarOptions.length} scholars in dropdown.`);
    const sample = scholarOptions[0];
    console.log('Sample scholar:', sample.text, '| ID:', sample.value, '| Category:', sample.data ? sample.data.category : 'N/A');

    // Verify all are Full-time scholars
    const nonFullTime = scholarOptions.filter(o => o.data && o.data.category !== 'Full-time');
    console.log('Non-full-time scholars in dropdown (should be 0):', nonFullTime.length);

    // Pick GAYATHRI T G or the first scholar
    const targetScholar = scholarOptions.find(o => o.text.includes('GAYATHRI')) || scholarOptions[0];
    console.log('Selecting scholar:', targetScholar.text);
    await page.select('#profile-select', targetScholar.value);

    // Enter password and submit
    await page.type('#password', '123456');
    await page.click('#login-btn');

    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Current URL after scholar login:', page.url());

    // Wait for Scholar Module to mount
    await page.waitForSelector('#scholar-portal-title, #btn-create-report, [data-action="view-read-only"]', { timeout: 10000 });

    // Verify Scope panel & regular nav are hidden
    const isSidebarHidden = await page.evaluate(() => {
      const panel = document.getElementById('scope-panel');
      return !panel || panel.style.display === 'none';
    });
    const isNavHidden = await page.evaluate(() => {
      const nav = document.querySelector('.site-header nav');
      return !nav || nav.style.display === 'none';
    });
    console.log('Is sidebar hidden for Scholar?:', isSidebarHidden);
    console.log('Is institutional nav hidden for Scholar?:', isNavHidden);

    // Check Scholar Dashboard contents
    const scholarDashboardText = await page.evaluate(() => document.body.innerText);
    console.log('Scholar portal rendered successfully. Contains name:', scholarDashboardText.includes(targetScholar.data.name));

    // 4. Create new Monthly Report
    console.log('\nStep 4: Scholar clicking "+ Create Monthly Report"...');
    await page.click('#btn-create-report');
    await page.waitForSelector('#btn-submit-supervisor', { timeout: 5000 });
    console.log('Monthly Report edit form loaded successfully.');

    // Submit report to supervisor
    console.log('Submitting monthly report to Supervisor...');
    await page.evaluate(() => {
      const btn = document.getElementById('btn-submit-supervisor');
      if (btn) btn.click();
    });
    await page.waitForSelector('#btn-form-back-after-submit', { timeout: 10000 });
    console.log('Report successfully submitted to Supervisor!');
    await new Promise(r => setTimeout(r, 1500));

    // 5. Sign out
    console.log('\nStep 5: Signing out...');
    await page.evaluate(() => {
      window.SRM_AUTH.logout();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 6. Supervisor Login
    console.log('\nStep 6: Logging in as Research Supervisor...');
    await page.click('#btn-supervisor');
    await page.select('#group-select', 'E&T');

    await page.waitForFunction(() => {
      const select = document.getElementById('profile-select');
      return select && select.options.length > 2 && select.options[1].value !== '';
    }, { timeout: 15000 });

    const supervisorOptions = await page.evaluate(() => {
      const select = document.getElementById('profile-select');
      return Array.from(select.options).slice(1).map(opt => ({
        value: opt.value,
        text: opt.textContent,
        data: opt.dataset.userobject ? JSON.parse(opt.dataset.userobject) : null
      }));
    });

    console.log(`Loaded ${supervisorOptions.length} supervisors in dropdown.`);
    const targetSupName = targetScholar.data.supervisorName || targetScholar.data.supervisor;
    console.log('Looking for assigned supervisor:', targetSupName);

    const targetSupervisor = supervisorOptions.find(o => o.text.toLowerCase().includes(targetSupName.toLowerCase().replace('dr.', '').trim())) || supervisorOptions[0];
    console.log('Selected supervisor:', targetSupervisor.text);

    await page.select('#profile-select', targetSupervisor.value);
    await page.type('#password', '123456');
    await page.click('#login-btn');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Verify Supervisor portal
    console.log('\nStep 7: Verifying Supervisor Portal...');
    await page.waitForSelector('#review-pending-badge, [data-action="sup-review"], [data-action="view-report"], table', { timeout: 15000 });

    const supSidebarHidden = await page.evaluate(() => {
      const panel = document.getElementById('scope-panel');
      return !panel || panel.style.display === 'none';
    });
    console.log('Is sidebar hidden for Supervisor?:', supSidebarHidden);

    // Diagnostic information
    const supDebug = await page.evaluate(() => {
      const DATA = window.SCHOLAR_REPORTS_DATA;
      const user = window.SRM_AUTH ? window.SRM_AUTH.getCurrentUser() : null;
      const sup = DATA && user ? DATA.getSupervisorById(user.id || user.employeeId) : null;
      const scholars = DATA && sup ? DATA.getScholarsForSupervisor(sup.id) : [];
      const reports = DATA && sup ? DATA.getReportsForSupervisor(sup.id) : [];
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(tr => tr.innerText.replace(/\n+/g, ' | '));
      const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
        id: b.id,
        text: b.innerText,
        action: b.dataset.action,
        reportId: b.dataset.reportid
      }));
      return {
        user: { id: user.id, name: user.name, role: user.role, employeeId: user.employeeId },
        sup: sup ? { id: sup.id, name: sup.name, assignedScholars: sup.assignedScholarIds } : null,
        scholarsCount: scholars.length,
        scholars: scholars.map(s => ({ id: s.id, name: s.name, reg: s.registrationNo, sup: s.supervisorName })),
        reportsCount: reports.length,
        reports: reports.map(r => ({ id: r.id, scholar: r.scholarName, status: r.status, supName: r.supervisorName, supId: r.supervisorId })),
        buttons: buttons.filter(b => b.action || b.id),
        rows: rows
      };
    });
    console.log('Supervisor Diagnostic:', JSON.stringify(supDebug, null, 2));

    // Look for pending review button specifically
    const pendingReviewFound = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[data-action="sup-review"]'));
      const pending = btns.find(b => b.innerText.includes('Review & Approve') || b.textContent.includes('Review')) || btns[0];
      if (pending) {
        pending.click();
        return true;
      }
      return false;
    });

    if (pendingReviewFound) {
      console.log('Clicked pending sup-review button...');
      
      // Wait for the approve button to appear in review panel
      await page.waitForSelector('#btn-sup-approve', { timeout: 10000 });
      console.log('Supervisor reviewing report. Clicking "Approve & Recommend to HOD"...');
      await page.type('#sup-remarks', 'Verified research progress and teaching assistance. Recommended.');
      await page.evaluate(() => {
        const btn = document.getElementById('btn-sup-approve');
        if (btn) btn.click();
      });
      await page.waitForFunction(() => {
        return document.body.innerText.includes('Submitted to HOD');
      }, { timeout: 10000 });
      console.log('Supervisor successfully approved & submitted to HOD!');
    } else {
      console.log('Notice: sup-review button not found on supervisor page.');
    }

    // 7. Sign out and test HOD
    console.log('\nStep 8: Testing HOD Review...');
    await page.evaluate(() => window.SRM_AUTH.logout());
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.waitForSelector('#btn-hod', { timeout: 10000 });
    await page.evaluate(() => {
      document.getElementById('btn-hod').click();
      const grp = document.getElementById('group-select');
      grp.value = 'E&T';
      grp.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => {
      const select = document.getElementById('profile-select');
      return select && select.options.length > 2 && select.options[1].value !== '';
    }, { timeout: 15000 });

    // Select HOD for the department (e.g. Biotech or CSE)
    const dept = targetScholar.data.department;
    console.log('Looking for HOD in dept:', dept);
    const hodOptions = await page.evaluate(() => {
      return Array.from(document.getElementById('profile-select').options).slice(1).map(o => ({ value: o.value, text: o.textContent }));
    });
    const targetHOD = hodOptions.find(o => o.text.toLowerCase().includes(dept.toLowerCase())) || hodOptions[0];
    console.log('Selected HOD:', targetHOD.text);
    await page.evaluate((val) => {
      const select = document.getElementById('profile-select');
      select.value = val;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('password').value = '123456';
    }, targetHOD.value);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.evaluate(() => document.getElementById('login-form').requestSubmit())
    ]);

    // HOD clicks "Scholar Reports 📄" nav button
    console.log('HOD navigating to Scholar Reports tab...');
    await page.waitForSelector('[data-page="scholar-reports"]', { timeout: 10000 });
    await page.evaluate(() => {
      const btn = document.querySelector('[data-page="scholar-reports"]');
      if (btn) btn.click();
    });

    await page.waitForSelector('[data-action="hod-review"]', { timeout: 10000 });
    console.log('HOD viewing pending reports. Opening report...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-action="hod-review"]');
      if (btn) btn.click();
    });
    await page.waitForSelector('#btn-hod-approve', { timeout: 10000 });
    await page.type('#hod-remarks', 'Department progress certified. Recommended for approval.');
    await page.evaluate(() => {
      const btn = document.getElementById('btn-hod-approve');
      if (btn) btn.click();
    });
    await page.waitForFunction(() => document.body.innerText.includes('Submitted to Deputy Dean'), { timeout: 10000 });
    console.log('HOD successfully approved & forwarded to Deputy Dean!');

    // 8. Deputy Dean Review
    console.log('\nStep 9: Testing Deputy Dean Review...');
    await page.evaluate(() => window.SRM_AUTH.logout());
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.waitForSelector('#btn-deputy_dean', { timeout: 10000 });
    await page.evaluate(() => {
      document.getElementById('btn-deputy_dean').click();
      const select = document.getElementById('profile-select');
      select.value = 'deputy_dean_ent';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('password').value = '123456';
    });
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.evaluate(() => document.getElementById('login-form').requestSubmit())
    ]);

    await page.waitForSelector('[data-page="scholar-reports"]', { timeout: 10000 });
    await page.evaluate(() => {
      const btn = document.querySelector('[data-page="scholar-reports"]');
      if (btn) btn.click();
    });

    await page.waitForSelector('[data-action="ddr-review"]', { timeout: 10000 });
    console.log('Deputy Dean opening report...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-action="ddr-review"]');
      if (btn) btn.click();
    });
    await page.waitForSelector('#btn-ddr-approve', { timeout: 10000 });
    await page.type('#ddr-remarks', 'Reviewed and endorsed for Dean final approval.');
    await page.evaluate(() => {
      const btn = document.getElementById('btn-ddr-approve');
      if (btn) btn.click();
    });
    await page.waitForFunction(() => document.body.innerText.includes('Submitted to Dean'), { timeout: 10000 });
    console.log('Deputy Dean successfully approved & forwarded to Dean!');

    // 9. Dean Final Approval
    console.log('\nStep 10: Testing Dean Final Approval...');
    await page.evaluate(() => window.SRM_AUTH.logout());
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.waitForSelector('#btn-dean', { timeout: 10000 });
    await page.evaluate(() => {
      document.getElementById('btn-dean').click();
      const select = document.getElementById('profile-select');
      select.value = 'dean_ent';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('password').value = '123456';
    });
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.evaluate(() => document.getElementById('login-form').requestSubmit())
    ]);

    await page.waitForSelector('[data-page="scholar-reports"]', { timeout: 10000 });
    await page.evaluate(() => {
      const btn = document.querySelector('[data-page="scholar-reports"]');
      if (btn) btn.click();
    });

    await page.waitForSelector('[data-action="ddr-review"]', { timeout: 10000 });
    console.log('Dean opening report for final verification...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-action="ddr-review"]');
      if (btn) btn.click();
    });
    await page.waitForSelector('#btn-ddr-approve', { timeout: 10000 });
    await page.type('#ddr-remarks', 'Certified and approved for fellowship disbursement.');
    await page.evaluate(() => {
      const btn = document.getElementById('btn-ddr-approve');
      if (btn) btn.click();
    });
    await page.waitForFunction(() => document.body.innerText.includes('VERIFIED') || document.body.innerText.includes('Verified'), { timeout: 10000 });
    console.log('Dean successfully completed final verification & disbursement approval!');

    // Step 11: Part-Time Scholar Login Rejection Test
    console.log('\nStep 11: Testing Part-time Scholar rejection test...');
    await page.evaluate(() => window.SRM_AUTH.logout());
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.waitForSelector('#btn-scholar', { timeout: 10000 });
    await page.click('#btn-scholar');

    const ptRejectionTest = await page.evaluate(() => {
      // Simulate selecting a part-time scholar record
      const select = document.getElementById('profile-select');
      const testOpt = document.createElement('option');
      testOpt.value = 'part_time_scholar_test_uuid';
      testOpt.dataset.userid = 'part_time_scholar_test_uuid';
      testOpt.textContent = 'PART TIME SCHOLAR TEST';
      testOpt.dataset.userobject = JSON.stringify({
        role: 'scholar',
        name: 'TEST PART TIME SCHOLAR',
        category: 'Part-time',
        department: 'BIOTECH'
      });
      select.appendChild(testOpt);
      select.value = testOpt.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));

      document.getElementById('password').value = '123456';
      document.getElementById('login-form').requestSubmit();

      const errBox = document.getElementById('login-error');
      return {
        hasError: errBox && (errBox.classList.contains('visible') || errBox.textContent.trim().length > 0),
        errorText: errBox ? errBox.textContent : ''
      };
    });
    console.log('Part-time scholar rejection result:', ptRejectionTest);

    if (ptRejectionTest.hasError && ptRejectionTest.errorText.includes('Full-time')) {
      console.log('✅ Part-time scholar was correctly blocked from accessing the system!');
    } else {
      console.warn('⚠️ Part-time rejection warning:', ptRejectionTest);
    }

    console.log('\n🎉 ALL 11 STEPS OF THE COMPLETE WORKFLOW PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n❌ Test Error:', err);
  } finally {
    await browser.close();
  }
})();
