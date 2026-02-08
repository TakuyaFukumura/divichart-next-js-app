import {formatYAxisValue} from '@/lib/formatYAxisValue';

describe('formatYAxisValue', () => {
    it('should return "0" for zero', () => {
        expect(formatYAxisValue(0)).toBe('0');
    });

    it('should format values less than 1000 as "N円"', () => {
        expect(formatYAxisValue(500)).toBe('500円');
        expect(formatYAxisValue(1)).toBe('1円');
        expect(formatYAxisValue(999)).toBe('999円');
    });

    it('should format values from 1000 to 9999 as "N千円" (no decimal)', () => {
        expect(formatYAxisValue(1000)).toBe('1千円');
        expect(formatYAxisValue(5000)).toBe('5千円');
        expect(formatYAxisValue(5500)).toBe('5千円'); // 小数点なし、切り捨て
        expect(formatYAxisValue(9999)).toBe('9千円');
    });

    it('should format values 10000 and above as "N万円" (no decimal)', () => {
        expect(formatYAxisValue(10000)).toBe('1万円');
        expect(formatYAxisValue(50000)).toBe('5万円');
        expect(formatYAxisValue(55000)).toBe('5万円'); // 小数点なし、切り捨て
        expect(formatYAxisValue(320000)).toBe('32万円');
        expect(formatYAxisValue(3200000)).toBe('320万円');
        expect(formatYAxisValue(15000000)).toBe('1500万円');
    });

    it('should handle negative values', () => {
        expect(formatYAxisValue(-500)).toBe('-500円');
        expect(formatYAxisValue(-5000)).toBe('-5千円');
        expect(formatYAxisValue(-50000)).toBe('-5万円');
    });
});
