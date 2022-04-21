export interface RegisterData {
  action: 'Register';
  /**
   * Stringified email
   * See [RFC 1123](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address).
   *
   * @pattern ^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$ Invalid email. Value is expected to match the pattern
   * [a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9]
   * (?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9]
   * (?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*
   * @format email
   */
  email: string;
}
