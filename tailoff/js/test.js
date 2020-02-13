import { LitElement, html } from "lit-element";

class MyElement extends LitElement {
    render() {
        return html`
            <p>Dit is mijn element</p>
        `;
    }
}

customElements.define("my-element", MyElement);
