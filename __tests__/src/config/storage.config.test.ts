import {getStorageItem, removeStorageItem, setStorageItem, storageKeys} from '@/config/storage.config';

describe('storage.config', () => {
    describe('storageKeys', () => {
        it('すべてのキーが定義されていること', () => {
            expect(storageKeys).toHaveProperty('theme');
            expect(storageKeys).toHaveProperty('exchangeRate');
            expect(storageKeys).toHaveProperty('goalSettings');
        });

        it('テーマキーが"theme"であること', () => {
            expect(storageKeys.theme).toBe('theme');
        });

        it('為替レートキーが"usdToJpyRate"であること', () => {
            expect(storageKeys.exchangeRate).toBe('usdToJpyRate');
        });

        it('目標設定キーが"goalSettings"であること', () => {
            expect(storageKeys.goalSettings).toBe('goalSettings');
        });

        it('すべてのキーが一意であること', () => {
            const keys = Object.values(storageKeys);
            const uniqueKeys = new Set(keys);
            expect(keys.length).toBe(uniqueKeys.size);
        });
    });

    describe('localStorage ヘルパー関数', () => {
        const testKey = 'testKey';
        const testValue = 'testValue';

        beforeEach(() => {
            // localStorageをクリア
            localStorage.clear();
        });

        afterEach(() => {
            localStorage.clear();
        });

        describe('getStorageItem', () => {
            it('存在するキーの値を取得できること', () => {
                localStorage.setItem(testKey, testValue);
                expect(getStorageItem(testKey)).toBe(testValue);
            });

            it('存在しないキーの場合nullを返すこと', () => {
                expect(getStorageItem('nonexistent')).toBeNull();
            });
        });

        describe('setStorageItem', () => {
            it('値を保存できること', () => {
                setStorageItem(testKey, testValue);
                expect(localStorage.getItem(testKey)).toBe(testValue);
            });

            it('既存の値を上書きできること', () => {
                localStorage.setItem(testKey, 'oldValue');
                setStorageItem(testKey, testValue);
                expect(localStorage.getItem(testKey)).toBe(testValue);
            });
        });

        describe('removeStorageItem', () => {
            it('値を削除できること', () => {
                localStorage.setItem(testKey, testValue);
                removeStorageItem(testKey);
                expect(localStorage.getItem(testKey)).toBeNull();
            });

            it('存在しないキーを削除してもエラーにならないこと', () => {
                expect(() => removeStorageItem('nonexistent')).not.toThrow();
            });
        });
    });
});
