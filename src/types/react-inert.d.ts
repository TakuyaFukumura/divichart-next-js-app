// inert 属性の型定義
// React の型定義にはまだ inert 属性が含まれていないため、拡張する
// 
// inert は HTML のブーリアン属性です。React では:
// - inert="" または inert={true} → HTML に inert 属性が追加される（要素が非アクティブになる）
// - inert={undefined} または inert={false} → HTML に inert 属性が追加されない（要素がアクティブのまま）
// 
// 空文字列 ('') を使用することで、HTML 仕様に準拠した動作を保証します。
declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        inert?: '' | undefined;
    }
}

export {};
