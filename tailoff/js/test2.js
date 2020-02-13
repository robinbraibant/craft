import { LitElement, html } from "lit-element";

class MySecondElement extends LitElement {
    render() {
        return html`
            <p>Dit is mijn tweede element</p>
        `;
    }
}

customElements.define("my-second-element", MySecondElement);
