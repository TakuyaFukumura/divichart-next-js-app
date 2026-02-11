// inert 属性の型定義
// React の型定義にはまだ inert 属性が含まれていないため、拡張する
declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        inert?: '' | undefined;
    }
}

export {};
