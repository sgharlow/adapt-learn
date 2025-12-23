const { chromium } = require('playwright');

async function recordDemo() {
  console.log('Starting demo recording...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: './recordings/',
      size: { width: 1280, height: 800 }
    }
  });

  const page = await context.newPage();

  try {
    // Clear any existing data
    await page.goto('http://localhost:3000');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    
    console.log('1. Loading homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('2. Clicking Get Started...');
    await page.getByRole('link', { name: /get started|start learning/i }).first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    console.log('3. Starting assessment...');

    console.log('   Q1: Selecting experience level...');
    await page.getByRole('button', { name: /C I code professionally/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1000);

    console.log('   Q2: Selecting goals...');
    await page.getByRole('button', { name: /B Build AI-powered applications/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1000);

    console.log('   Q3: Selecting time commitment...');
    await page.getByRole('button', { name: /B 3-5 hours/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1000);

    console.log('   Q4: Selecting ML background...');
    await page.getByRole('button', { name: /B Followed some tutorials/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1000);

    console.log('   Q5: Selecting neural network knowledge...');
    await page.getByRole('button', { name: /B I know the concept/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1000);

    console.log('   Q6: Selecting math interest...');
    await page.getByRole('button', { name: /B Somewhat interested/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'See Results', exact: true }).click();
    await page.waitForTimeout(2000);

    console.log('4. Viewing path recommendation...');
    await page.waitForTimeout(2000);

    console.log('5. Starting AI Practitioner path...');
    // Fixed: This is a button, not a link
    await page.getByRole('button', { name: /Start AI Practitioner Path/i }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('6. On path page, clicking first lesson...');
    await page.getByRole('link', { name: /Ml Fundamentals 01/i }).first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('7. Playing audio...');
    const playButton = page.getByRole('button', { name: /play/i }).first();
    if (await playButton.isVisible()) {
      await playButton.click();
      await page.waitForTimeout(5000);
      const pauseButton = page.getByRole('button', { name: /pause/i }).first();
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
      }
    }
    await page.waitForTimeout(1500);

    console.log('8. Opening AI Tutor...');
    const tutorButton = page.getByRole('button', { name: /ask|tutor|question/i }).first();
    if (await tutorButton.isVisible()) {
      await tutorButton.click();
      await page.waitForTimeout(1500);

      console.log('9. Asking AI Tutor a question...');
      const textInput = page.getByRole('textbox').first();
      if (await textInput.isVisible()) {
        await textInput.fill("What is the difference between machine learning and traditional programming?");
        await page.waitForTimeout(500);

        const sendButton = page.getByRole('button', { name: /send|submit|ask/i }).first();
        if (await sendButton.isVisible()) {
          await sendButton.click();
          await page.waitForTimeout(5000);
        }
      }
    }
    await page.waitForTimeout(2000);

    console.log('10. Taking quiz...');
    const quizButton = page.getByRole('button', { name: /take quiz|start quiz/i }).first();
    if (await quizButton.isVisible()) {
      await quizButton.click();
      await page.waitForTimeout(2000);

      for (let i = 0; i < 4; i++) {
        console.log('    Answering quiz question ' + (i + 1) + '...');
        const options = page.locator('button').filter({ hasText: /^[A-D]s/ });
        const count = await options.count();
        if (count > 0) {
          await options.first().click();
          await page.waitForTimeout(1500);
        }
      }
      await page.waitForTimeout(2000);
    }

    console.log('11. Navigating to dashboard...');
    await page.getByRole('link', { name: /dashboard/i }).first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('12. Scrolling dashboard...');
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);

    console.log('Demo recording complete!');
  } catch (error) {
    console.error('Error during recording:', error);
  }

  await context.close();
  await browser.close();

  console.log('Video saved to ./recordings/');
}

recordDemo().catch(console.error);
