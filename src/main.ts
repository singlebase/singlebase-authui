import { defineCustomElement } from 'vue';
import Main from './Main.ce.vue';
import styles from './styles.scss?inline';

console.log(styles.toString())
const myDefinedComponent = defineCustomElement(Main, {
  shadowRoot: true,
  styles:[styles.toString()]
});

customElements.define('singlebase-authui', myDefinedComponent);

