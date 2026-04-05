import { retryWithBackoff } from '../utils/retry-utils';

describe('retryWithBackoff', () => {
  it('should return result on successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3, 100);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3, 100);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries exceeded', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));

    await expect(retryWithBackoff(fn, 2, 100)).rejects.toThrow('always fails');

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
