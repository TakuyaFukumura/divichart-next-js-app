// inert 属性の型定義
// React 19 では inert 属性がネイティブでサポートされていますが、
// 型定義が完全ではない場合があるため、明示的に定義します。
// 
// inert は HTML のブーリアン属性です。
// - inert={true} → 要素とその子孫が非アクティブになる
// - inert={false} または省略 → 要素がアクティブのまま
declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        inert?: boolean;
    }
}

export {};
