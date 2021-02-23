import * as tasks from '../src';
import * as path from 'path';
import playwright from 'playwright';


describe('EveryTask', () => {
  const wait = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout));

  it('should call callback in correct order in node.js', async () => {
    const spy = jest.fn();

    tasks.task(() => spy(3));
    tasks.task(() => spy(3));
    tasks.macrotask(() => spy(2));
    tasks.macrotask(() => spy(2));
    tasks.microtask(() => spy(1));
    tasks.microtask(() => spy(1));
    tasks.synchronous(() => spy(0));
    tasks.synchronous(() => spy(0));

    await wait(200);

    const callOrder = spy.mock.calls.map(([expectedPriority]) => expectedPriority);
    expect(callOrder).toMatchObject([0,0,1,1,2,2,3,3]);

  });

  for (const browserType of ['chromium', 'firefox', 'webkit'] as const) {
    it(`should call callback in correct order in ${browserType}`, async () => {
  
      const browser = await playwright[browserType].launch();
      const page = await browser.newPage();
      await page.setContent(`
        <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body>
            <script>
              var exports = {};
            </script>
          </body>
        </html>
      `);
  
      await page.addScriptTag({
        path: path.resolve(__dirname, "../dist/everytask.cjs.production.min.js"),
      });
  
      await page.addScriptTag({
        content: `
          const calls = [];
          const tasks = exports;

          tasks.task(() => calls.push(3));
          tasks.task(() => calls.push(3));
          tasks.macrotask(() => calls.push(2));
          tasks.macrotask(() => calls.push(2));
          tasks.microtask(() => calls.push(1));
          tasks.microtask(() => calls.push(1));
          tasks.synchronous(() => calls.push(0));
          tasks.synchronous(() => calls.push(0));
        `
      });

      await wait(400);
  
      const callOrder = await page.evaluate(() => {
        // @ts-ignore;
        return calls;
      });
  
      expect(callOrder).toMatchObject([0,0,1,1,2,2,3,3]);
  
      await browser.close();
    })
  }


  it('should handle fuzzing test in node.js', async () => {
    const spy = jest.fn();

    const taskNameByPriority = {
      task: 3,
      macrotask: 2,
      microtask: 1,
      synchronous: 0,
    } as any;

    const taskNames = Object.keys(tasks);
    const taskCreators = Array.from({ length: 4000 })
      .map((_) => {
        var randomTaskName = taskNames[Math.floor(Math.random() * taskNames.length)];
        const taskCreator : Function = (tasks as any)[randomTaskName];
        const priority : number = (taskNameByPriority as any)[randomTaskName];
        return () => taskCreator(() => spy(priority))
      });

    taskCreators.forEach((taskCreator) => taskCreator());

    await wait(3000);

    const callOrder = spy.mock.calls.map(([expectedPriority]) => expectedPriority);
    const isCalledInRightOrder = callOrder.every((priority, i, arr) => {
      return i === 0 || priority >= arr[i-1];
    })
    expect(isCalledInRightOrder).toBe(true);
  });

  for (const browserType of ['chromium', 'firefox', 'webkit'] as const) {
    it(`should handle fuzzing test in ${browserType}`, async () => {
      const browser = await playwright[browserType].launch();
      const page = await browser.newPage();
      await page.setContent(`
        <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body>
            <script>
              var exports = {};
            </script>
          </body>
        </html>
      `);
  
      await page.addScriptTag({
        path: path.resolve(__dirname, "../dist/everytask.cjs.production.min.js"),
      });
  
      await page.addScriptTag({
        content: `
          const calls = [];
          const tasks = exports;

          const taskNameByPriority = {
            task: 3,
            macrotask: 2,
            microtask: 1,
            synchronous: 0,
          };
      
          const taskNames = Object.keys(tasks);
          const taskCreators = Array.from({ length: 4000 })
            .map((_) => {
              var randomTaskName = taskNames[Math.floor(Math.random() * taskNames.length)];
              const taskCreator = tasks[randomTaskName];
              const priority = taskNameByPriority[randomTaskName];
              return () => taskCreator(() => calls.push(priority))
            });
      
          taskCreators.forEach((taskCreator) => taskCreator());
        `
      });

      await wait(400);
  
      const callOrder : number[] = await page.evaluate(() => {
        // @ts-ignore;
        return calls;
      });
  
      const isCalledInRightOrder = callOrder.every((priority, i, arr) => {
        return i === 0 || priority >= arr[i-1];
      })
      expect(isCalledInRightOrder).toBe(true);

      await browser.close();
    })
  }
});

