import * as tasks from '../src';


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
});

