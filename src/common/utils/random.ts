export class Random {
  text() {
    let value: string = "";

    for (let i = 0; i < 5; i++) {
      value += Math.random().toString(36).substring(2);
    }

    return value;
  }
}
